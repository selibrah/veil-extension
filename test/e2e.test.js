// Loads the real extension in Chromium against a stand-in chatgpt.com page and drives every feature.
// Run: npm run test:e2e   (first time: npm install && npx playwright install chromium)
// Set SHOTS=dir to also save screenshots (used for the store images).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const EXT = path.resolve(__dirname, '../extension');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixtures/chat.html'), 'utf8');
const SHOTS = process.env.SHOTS && path.resolve(process.env.SHOTS);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('Veil end to end', async (t) => {
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'veil-')), {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
  });
  t.after(() => ctx.close());
  // Every request from the chat page (with Veil's content script), the popup, settings and Veil's service worker, for the no-network check.
  const requests = [];
  ctx.on('request', (r) => requests.push({ url: r.url(), nav: r.isNavigationRequest() }));
  await ctx.route('https://chatgpt.com/**', (r) => r.fulfill({ contentType: 'text/html', body: FIXTURE }));

  const errors = [];
  const watch = (p) => {
    p.on('pageerror', (e) => errors.push(`${p.url()}: ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && errors.push(`${p.url()}: ${m.text()}`));
    return p;
  };
  const shot = (p, name, opts) => SHOTS && p.screenshot({ path: path.join(SHOTS, `${name}.png`), ...opts });

  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'));
  const extId = new URL(sw.url()).host;
  const inExt = (fn, arg) => sw.evaluate(fn, arg); // runs inside the extension's service worker
  const tellPage = (msg) => inExt(async (m) => {
    for (const tab of await chrome.tabs.query({})) {
      const r = await chrome.tabs.sendMessage(tab.id, m).catch(() => undefined);
      if (r !== undefined) return { tabId: tab.id, reply: r };
    }
    return null;
  }, msg);
  // Text of an element in Veil's closed shadow root: page scripts can't see in, the DevTools protocol can.
  const overlayText = async (p, cls) => {
    const cdp = await ctx.newCDPSession(p);
    const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
    await cdp.detach();
    const find = (n) => {
      const a = n.attributes || [];
      for (let i = 0; i < a.length; i += 2) if (a[i] === 'class' && a[i + 1] === cls) return n;
      for (const c of [...(n.children || []), ...(n.shadowRoots || [])]) { const hit = find(c); if (hit) return hit; }
      return null;
    };
    const el = find(root);
    return el && (el.children || []).map((c) => c.nodeValue).join('');
  };

  await t.test('install opens the welcome page', async () => {
    const welcome = ctx.pages().find((p) => p.url().includes('options.html#welcome')) || (await ctx.waitForEvent('page'));
    assert.match(welcome.url(), /options\.html#welcome/);
    await welcome.close();
  });

  const page = watch(await ctx.newPage());
  await page.goto('https://chatgpt.com/c/lease-1');
  const filter = (sel) => page.$eval(sel, (el) => getComputedStyle(el).filter);
  const shown = (sel) => page.$eval(sel, (el) => getComputedStyle(el).display !== 'none');
  const until = (fn, arg) => page.waitForFunction(fn, arg, { timeout: 5000 });
  // Wait for the blur to finish its .15s transition rather than a fixed sleep (a cold browser start can be slow).
  await until(() => getComputedStyle(document.querySelector('a[href="/c/trip-2"]')).filter === 'blur(6px)');

  await t.test('Private mode blurs the chat list and images only', async () => {
    assert.match(await filter('a[href="/c/trip-2"]'), /blur\(6px\)/);
    assert.match(await filter('main img'), /blur/);
    assert.equal(await filter('[data-message-author-role="user"]'), 'none');
    assert.equal(await filter('#prompt-textarea'), 'none');
    await shot(page, 'private');
  });

  await t.test('hovering a chat reveals just that chat', async () => {
    await page.hover('a[href="/c/trip-2"]');
    await sleep(500);
    assert.equal(await filter('a[href="/c/trip-2"]'), 'none');
    assert.match(await filter('a[href="/c/react-4"]'), /blur/);
    await page.mouse.move(900, 700);
  });

  await t.test('Custom areas and blur strength apply live', async () => {
    await inExt(() => chrome.storage.local.set({ mode: 'custom', custom: ['conv', 'input'], strength: 10 }));
    await until(() => document.documentElement.dataset.veil === 'conv input');
    await sleep(300);
    assert.match(await filter('[data-message-author-role="user"]'), /blur\(10px\)/);
    assert.match(await filter('#prompt-textarea'), /blur\(10px\)/);
    assert.equal(await filter('a[href="/c/trip-2"]'), 'none');
    await inExt(() => chrome.storage.local.set({ mode: 'private', strength: 6 }));
  });

  await t.test('Present mode blurs everything and turns hover reveal off', async () => {
    await inExt(() => chrome.storage.local.set({ mode: 'present' }));
    await until(() => document.documentElement.dataset.veil === 'side conv input img');
    assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-veil-hover')), false);
    assert.equal(await page.title(), 'ChatGPT'); // the tab strip stops showing the chat's title
    await sleep(300);
    await shot(page, 'present');
    await inExt(() => chrome.storage.local.set({ mode: 'private' }));
    await until(() => document.title === 'Lease review');
  });

  await t.test('switching tabs blurs the page until you come back and move', async () => {
    await inExt(() => chrome.storage.session.set({ awayAt: Date.now() })); // same path as idle
    await until(() => document.documentElement.hasAttribute('data-veil-cover'));
    await sleep(200);
    await shot(page, 'away');
    await page.mouse.move(600, 400);
    await page.mouse.move(610, 410);
    await until(() => !document.documentElement.hasAttribute('data-veil-cover'));
  });

  await t.test('keywords hide matching chats, case-insensitive', async () => {
    await inExt(() => chrome.storage.local.set({ keywords: ['SALARY'] }));
    await until(() => document.querySelector('a[href="/c/salary-3"]').hasAttribute('data-veil-hidden'));
    assert.equal(await shown('a[href="/c/salary-3"]'), false);
    assert.equal(await shown('a[href="/c/trip-2"]'), true);
  });

  await t.test('popup status reports the site and the open chat', async () => {
    const { reply } = await tellPage({ type: 'status' });
    assert.deepEqual(reply, { site: 'ChatGPT', missing: [], chat: { id: 'lease-1', title: 'Lease review' } });
  });

  await t.test('"Hide the open chat" hides it and remembers the title', async () => {
    await tellPage({ type: 'hide-current' });
    await until(() => document.querySelector('a[href="/c/lease-1"]').hasAttribute('data-veil-hidden'));
    const { hiddenChats } = await inExt(() => chrome.storage.local.get('hiddenChats'));
    assert.equal(hiddenChats['lease-1'], 'Lease review');
  });

  await t.test('right-click "Hide this chat" hides the clicked chat, including project chats', async () => {
    await page.click('a[href="/g/g-p-123-work/c/logo-7"]', { button: 'right' });
    await inExt(async () => {
      for (const tab of await chrome.tabs.query({})) chrome.tabs.sendMessage(tab.id, { type: 'hide-chat' }).catch(() => {});
    });
    await until(() => document.querySelector('a[href*="logo-7"]').hasAttribute('data-veil-hidden'));
    const { hiddenChats } = await inExt(() => chrome.storage.local.get('hiddenChats'));
    assert.equal(hiddenChats['logo-7'], 'Logo ideas for the bakery');
  });

  await t.test('the "chat hidden" toast never shows the title (it sits above the Present blur)', async () => {
    await inExt(() => chrome.storage.local.set({ mode: 'present' }));
    await until(() => document.documentElement.hasAttribute('data-veil-cover'));
    await page.click('a[href="/c/doctor-5"]', { button: 'right' });
    await inExt(async () => {
      for (const tab of await chrome.tabs.query({})) chrome.tabs.sendMessage(tab.id, { type: 'hide-chat' }).catch(() => {});
    });
    await until(() => document.querySelector('a[href="/c/doctor-5"]').hasAttribute('data-veil-hidden'));
    assert.equal(await overlayText(page, 'toast'), 'Chat hidden');
    await inExt(async () => {
      const { hiddenChats } = await chrome.storage.local.get('hiddenChats');
      delete hiddenChats['doctor-5'];
      await chrome.storage.local.set({ hiddenChats, mode: 'private' });
    });
    await until(() => document.documentElement.dataset.veil === 'side img' && !document.querySelector('a[href="/c/doctor-5"]').hasAttribute('data-veil-hidden'));
  });

  await t.test('"Show" brings hidden chats back temporarily', async () => {
    await inExt(() => chrome.storage.session.set({ showHidden: true }));
    await until(() => document.documentElement.hasAttribute('data-veil-show-hidden'));
    assert.equal(await shown('a[href="/c/salary-3"]'), true);
    await inExt(() => chrome.storage.session.set({ showHidden: false }));
    await until(() => !document.documentElement.hasAttribute('data-veil-show-hidden'));
  });

  await t.test('PIN lock: wrong PIN stays locked, right PIN unlocks, reload re-locks', async () => {
    await inExt(async () => {
      await globalThis.VeilCore.setPin('2468');
      await chrome.storage.session.set({ unlocked: false });
    });
    await until(() => document.body.inert === true);
    await sleep(300);
    await shot(page, 'lock');
    await page.keyboard.type('1111');
    await sleep(1500);
    assert.equal(await page.evaluate(() => document.body.inert), true);
    assert.equal((await inExt(() => chrome.storage.local.get('pinFails'))).pinFails, 1);
    await page.keyboard.type('2468');
    await until(() => document.body.inert === false);

    await inExt(() => chrome.storage.session.set({ unlocked: false }));
    await page.reload();
    await until(() => document.body && document.body.inert === true);
    await sleep(300);
    await page.keyboard.type('2468');
    await until(() => document.body.inert === false);
  });

  await t.test('while locked the page gets no keys, not even the PIN typed into the lock', async () => {
    // Stands in for the site's own shortcuts and scripts (main world, so they run after Veil's listeners).
    await page.evaluate(() => {
      window.seen = [];
      for (const type of ['keydown', 'keyup', 'keypress', 'beforeinput', 'input']) {
        addEventListener(type, (e) => window.seen.push(`${type}:${e.key ?? e.data}`), true);
        document.addEventListener(type, (e) => window.seen.push(`document ${type}:${e.key ?? e.data}`));
      }
    });
    await inExt(() => chrome.storage.session.set({ unlocked: false }));
    await until(() => document.body.inert === true);
    await sleep(300); // the PIN box takes focus a tick after the lock appears
    await page.keyboard.type('24');
    await page.keyboard.press('ControlOrMeta+A'); // shortcuts typed in the PIN box don't act: no select-all, so all four digits count
    await page.keyboard.type('68');
    await until(() => document.body.inert === false);
    assert.deepEqual(await page.evaluate(() => window.seen), []);
  });

  await t.test('locked pages stay locked when Veil loads before <body>, and print blank', async () => {
    await inExt(() => chrome.storage.session.set({ unlocked: false }));
    await until(() => document.body.inert === true);
    // A slow script in <head> holds <body> back, as a real site's bundles can.
    await ctx.route('https://chatgpt.com/slow.js', async (r) => { await sleep(1000); await r.fulfill({ contentType: 'text/javascript', body: '' }); });
    await ctx.route('https://chatgpt.com/c/slow-9', (r) => r.fulfill({ contentType: 'text/html', body: FIXTURE.replace('<head>', '<head><script src="/slow.js"></script>') }));
    const slow = watch(await ctx.newPage());
    await slow.goto('https://chatgpt.com/c/slow-9');
    await slow.waitForFunction(() => document.body.inert === true, null, { timeout: 5000 });
    assert.equal(await slow.title(), 'ChatGPT');
    await slow.emulateMedia({ media: 'print' });
    assert.equal(await slow.evaluate(() => getComputedStyle(document.body).display), 'none');
    await slow.close();
    await page.keyboard.type('2468');
    await until(() => document.body.inert === false);
  });

  await t.test('if settings are slow to load, the page stays covered instead of showing', async () => {
    // Like a cold start after a Chrome restart: the page can't read the lock state until the busy worker answers.
    await inExt(() => chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }));
    const busy = inExt(() => { const end = Date.now() + 4000; while (Date.now() < end); });
    await sleep(200); // let the worker get busy first
    const cold = watch(await ctx.newPage());
    await cold.goto('https://chatgpt.com/c/lease-1');
    await cold.waitForFunction(() => !document.documentElement.hasAttribute('data-veil-loading'), null, { timeout: 5000 });
    const state = await cold.evaluate(() => ({
      settingsLoaded: document.documentElement.hasAttribute('data-veil'),
      covered: document.documentElement.hasAttribute('data-veil-cover'),
    }));
    assert.deepEqual(state, { settingsLoaded: false, covered: true });
    await busy;
    await cold.waitForFunction(() => document.body.inert === true, null, { timeout: 5000 }); // then the lock arrives
    await cold.close();
    await inExt(() => chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' }));
  });

  await t.test('popup shows live status and changes settings', async () => {
    const { tabId } = await tellPage({ type: 'status' });
    const popup = watch(await ctx.newPage());
    await popup.setViewportSize({ width: 340, height: 760 });
    // A real popup asks for the active tab; opened as a page it would see itself, so point it at the chat tab.
    await popup.addInitScript((id) => { chrome.tabs.query = async () => [{ id }]; }, tabId);
    await popup.goto(`chrome-extension://${extId}/popup/popup.html`);
    await popup.waitForFunction(() => document.getElementById('status').textContent !== 'Loading');
    assert.equal(await popup.textContent('#status'), 'ChatGPT · Armed');
    assert.equal(await popup.textContent('#hidden-count'), '2 chats hidden + 1 keyword');
    assert.equal(await popup.getAttribute('[data-mode="private"]', 'aria-pressed'), 'true');
    await shot(popup, 'popup', { fullPage: true });

    await popup.click('[data-area="conv"]');
    await popup.waitForFunction(() => document.querySelector('[data-mode="custom"]').getAttribute('aria-pressed') === 'true');
    assert.deepEqual((await inExt(() => chrome.storage.local.get('custom'))).custom, ['side', 'conv', 'img']);
    await until(() => document.documentElement.dataset.veil === 'side conv img');

    await popup.click('#show-hidden'); // PIN is set, so it asks for it
    await popup.locator('#show-pin input').pressSequentially('2468'); // focuses the box first; it grabs focus a tick after it appears
    await until(() => document.documentElement.hasAttribute('data-veil-show-hidden'));

    await popup.click('#lockdown'); // locks and puts hidden chats away again
    await until(() => document.body.inert === true && !document.documentElement.hasAttribute('data-veil-show-hidden'));
    await popup.close();
  });

  await t.test('settings page is behind the PIN and lists hidden chats', async () => {
    const opts = watch(await ctx.newPage());
    await opts.goto(`chrome-extension://${extId}/options/options.html`);
    await opts.waitForSelector('#gate:not([hidden]) input');
    assert.equal(await opts.isVisible('#content'), false);
    await opts.locator('#gate input').pressSequentially('2468');
    await opts.waitForSelector('#content:not([hidden])');
    const titles = await opts.$$eval('#hidden-list .grow', (els) => els.map((e) => e.textContent));
    assert.deepEqual(titles.sort(), ['Lease review', 'Logo ideas for the bakery']);
    await shot(opts, 'options', { fullPage: true });

    await opts.click('#hidden-list .row:first-child button'); // Unhide
    await opts.waitForFunction(() => document.querySelectorAll('#hidden-list .row').length === 1);
  });

  await t.test('an open settings page asks for the PIN again after Lockdown or auto-lock', async () => {
    const opts = ctx.pages().find((p) => p.url().includes('/options/options.html'));
    // It was unlocked while the chat tab was locked; the lock below is what Lockdown and auto-lock write.
    await inExt(() => chrome.storage.session.set({ unlocked: false, showHidden: false }));
    await opts.waitForSelector('#gate:not([hidden]) input', { timeout: 5000 });
    assert.equal(await opts.isVisible('#content'), false);
    await opts.close();
  });

  await t.test('no errors anywhere', () => assert.deepEqual(errors, []));

  await t.test('no network requests: only Veil\'s own files and the chat page itself', () => {
    const own = `chrome-extension://${extId}/`;
    const fixture = (r) => (r.nav && r.url.startsWith('https://chatgpt.com/')) || r.url === 'https://chatgpt.com/slow.js'; // the stand-in page itself
    const offsite = requests.filter((r) => !r.url.startsWith(own) && !fixture(r));
    assert.deepEqual(offsite, []);
    assert.ok(requests.some((r) => r.url.startsWith(`${own}fonts/`)), 'requests are being recorded'); // the lock screen loads Veil's fonts
  });

  // Last: it reloads the extension, which leaves the open tab running the old, disconnected copy.
  await t.test('after an update, an open tab covers itself until reloaded', async () => {
    await inExt(() => chrome.storage.session.set({ unlocked: true }));
    await until(() => document.body.inert === false && !document.documentElement.hasAttribute('data-veil-cover'));
    await inExt(() => chrome.runtime.reload()).catch(() => {}); // the worker goes away mid-call
    await until(() => document.documentElement.hasAttribute('data-veil-cover'));
  });
});
