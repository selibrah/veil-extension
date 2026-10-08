// Runs on ChatGPT, Claude and Gemini at document_start: applies blur, hides chats, draws the lock screen.
(() => {
  const site = globalThis.VeilSites[location.hostname];
  if (!site || window.top !== window) return;
  const V = globalThis.VeilCore;
  const html = document.documentElement;

  let s = null; // settings from storage.local
  let sess = { unlocked: false, showHidden: false, awayAt: 0 };
  let away = false; // blurred because you left the tab or went idle
  let orphaned = false; // Veil was updated or removed while this tab stayed open
  const locked = () => !!s && V.isLocked(s, sess);

  // ---------- page CSS, built from this site's selectors ----------
  const all = V.AREAS.map((a) => site[a]).join(', ');
  const RULES = `
html[data-veil-loading] body { visibility: hidden !important; }
${V.AREAS.map((a) => `html[data-veil~="${a}"] :is(${site[a]}) { filter: blur(var(--veil-blur)) !important; transition: filter .15s; }`).join('\n')}
html[data-veil-hover] :is(${all}):hover { filter: none !important; transition-delay: .15s; }
html:not([data-veil-show-hidden]) [data-veil-hidden] { display: none !important; }
html[data-veil-show-hidden] [data-veil-hidden] { outline: 2px dashed #ff3377 !important; outline-offset: -2px; }
@media print { html[data-veil-locked] body { display: none !important; } }`;
  const style = document.createElement('style');
  const setStrength = (px) => (style.textContent = `${RULES}\n:root { --veil-blur: ${px}px; }`);
  setStrength(V.DEFAULTS.strength);

  // Keep the page hidden until settings load so nothing private flashes on screen.
  // If they're still not here after 1.5 s, fail closed: show the page under the blur cover.
  html.setAttribute('data-veil-loading', '');
  setTimeout(() => {
    if (!s) { ui.veil.hidden = false; html.setAttribute('data-veil-cover', ''); }
    html.removeAttribute('data-veil-loading');
  }, 1500);

  // ---------- overlay: Present/away blur, lock screen, toast ----------
  const host = document.createElement('veil-root');
  const root = host.attachShadow({ mode: 'closed' });
  root.innerHTML = `<style>
:host { all: initial; }
[hidden] { display: none !important; }
.veil { position: fixed; inset: 0; z-index: 2147483646; pointer-events: none; background: rgba(249,246,238,.08);
  backdrop-filter: blur(max(16px, calc(var(--veil-blur) * 2))); -webkit-backdrop-filter: blur(max(16px, calc(var(--veil-blur) * 2))); }
.lock { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; background: rgba(12,16,26,.88);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); font-family: 'Veil Jakarta', system-ui, sans-serif; }
.card { box-sizing: border-box; width: min(340px, 90vw); padding: 24px 28px; text-align: center; color: #0c101a; background: #fff;
  border: 3.5px solid #0c101a; border-radius: 18px; box-shadow: 8px 8px 0 #ff3377, 8px 8px 0 3px #0c101a; }
.badge { width: 60px; height: 60px; margin: 0 auto 8px; display: grid; place-items: center; border-radius: 50%; background: #fed130;
  border: 3px solid #0c101a; box-shadow: 3px 3px 0 #0c101a; animation: wiggle 2.5s infinite ease-in-out; }
.badge svg { width: 30px; height: 30px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
h1 { margin: 0; font: 28px/1.1 'Veil Bangers', Impact, 'Arial Black', sans-serif; letter-spacing: .05em; }
p { margin: 6px 0 0; font-size: 13px; font-weight: 700; color: #475569; }
input { box-sizing: border-box; width: 170px; margin-top: 12px; padding: 10px 14px; text-align: center; color: #0c101a; background: #f8fafc;
  font: 700 22px/1 ui-monospace, Menlo, monospace; letter-spacing: .35em; border: 2.5px solid #0c101a; border-radius: 10px;
  box-shadow: 3px 3px 0 #0c101a; outline: none; }
input:focus { background: #fff; border-color: #ff3377; }
.err { min-height: 18px; margin-top: 8px; font-size: 12px; font-weight: 800; color: #c8104f; }
.shake { animation: shake .3s; }
.toast { position: fixed; left: 50%; bottom: 24px; z-index: 2147483647; transform: translateX(-50%); max-width: 80vw; padding: 8px 14px;
  font: 700 13px/1.3 'Veil Jakarta', system-ui, sans-serif; color: #0c101a; background: #fed130; border: 2.5px solid #0c101a;
  border-radius: 10px; box-shadow: 3px 3px 0 #0c101a; }
@keyframes wiggle { 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
@keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@media (prefers-reduced-motion: reduce) { .badge, .shake { animation: none; } }
</style>
<div class="veil" hidden></div>
<div class="lock" hidden role="dialog" aria-modal="true" aria-labelledby="veil-title">
  <div class="card">
    <div class="badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/><path d="M8 11v-4a4 4 0 1 1 8 0v4"/></svg></div>
    <h1 id="veil-title">Veil locked!</h1>
    <p>Enter your PIN to continue</p>
    <input type="password" inputmode="numeric" autocomplete="off" maxlength="8" aria-label="PIN">
    <div class="err" role="alert"></div>
  </div>
</div>
<div class="toast" hidden role="status"></div>`;
  const $ = (sel) => root.querySelector(sel);
  const ui = { veil: $('.veil'), lock: $('.lock'), card: $('.card'), pin: $('input'), err: $('.err'), toast: $('.toast') };

  let fontsLoaded = false;
  function loadFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    for (const [family, file, weight] of [['Veil Bangers', 'Bangers', '400'], ['Veil Jakarta', 'PlusJakartaSans', '500 800']]) {
      new FontFace(family, `url(${chrome.runtime.getURL(`fonts/${file}.woff2`)})`, { weight })
        .load().then((f) => document.fonts.add(f)).catch(() => {});
    }
  }

  let toastTimer;
  function toast(text) {
    loadFonts();
    ui.toast.textContent = text;
    ui.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (ui.toast.hidden = true), 2500);
  }

  // The page may re-render <head>/<html>; put our nodes back if they get removed.
  function mount() {
    if (!style.isConnected) (document.head || html).append(style);
    if (!host.isConnected) html.append(host);
  }
  mount();

  // ---------- render state onto the page ----------
  let weSetInert = false;
  function render() {
    mount();
    if (!s) return;
    html.removeAttribute('data-veil-loading');
    const present = s.mode === 'present';
    const isLocked = locked();
    html.setAttribute('data-veil', V.areasFor(s).join(' '));
    html.toggleAttribute('data-veil-hover', s.hoverReveal && !present);
    html.toggleAttribute('data-veil-show-hidden', !!sess.showHidden);
    html.toggleAttribute('data-veil-locked', isLocked);
    setStrength(s.strength);
    ui.veil.hidden = isLocked || !(present || away || orphaned);
    html.toggleAttribute('data-veil-cover', !ui.veil.hidden);
    if (ui.lock.hidden === isLocked) {
      ui.lock.hidden = !isLocked;
      if (isLocked) {
        loadFonts();
        ui.toast.hidden = true; // no toast on top of the lock screen
        ui.pin.value = '';
        ui.err.textContent = '';
        setTimeout(() => ui.pin.focus());
      }
    }
    syncInert();
    syncTitle();
    scan();
  }

  // inert blocks clicks and focus on the page underneath; only undo it if we set it.
  // Also runs on DOM changes, because settings can load before <body> exists.
  function syncInert() {
    const isLocked = locked();
    if (document.body && (isLocked || weSetInert)) {
      document.body.inert = isLocked;
      weSetInert = isLocked;
    }
  }

  // The tab strip (and a shared screen) shows the open chat's title. Cover it while locked or in Present.
  let realTitle = '';
  function syncTitle() {
    const mask = locked() || (!!s && s.mode === 'present');
    if (mask && document.title !== site.name) {
      realTitle = document.title;
      document.title = site.name;
    } else if (!mask && realTitle) {
      if (document.title === site.name) document.title = realTitle;
      realTitle = '';
    }
  }

  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  function chatOf(el) {
    const a = el.closest('a') || el.querySelector('a');
    const title = clean(el.textContent);
    return { id: V.chatIdFromHref(a && a.getAttribute('href')) || `title:${title}`, title };
  }

  function scan() {
    if (!s) return;
    for (const el of document.querySelectorAll(site.side)) {
      const { id, title } = chatOf(el);
      el.toggleAttribute('data-veil-hidden', V.isHiddenChat(id, title, s));
    }
  }

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      mount();
      syncInert();
      syncTitle();
      scan();
    }, 150);
  };
  new MutationObserver(schedule).observe(html, { childList: true, subtree: true, characterData: true });

  // ---------- lock screen ----------
  let checking = false;
  async function tryPin() {
    if (checking) return;
    checking = true;
    const r = await V.checkPin(ui.pin.value);
    checking = false;
    ui.pin.value = '';
    if (r.ok) return sessionSet({ unlocked: true });
    ui.err.textContent = r.wait ? `Too many tries. Wait ${Math.ceil(r.wait / 1000)}s.` : 'Wrong PIN. Try again.';
    ui.card.classList.remove('shake');
    void ui.card.offsetWidth; // restart the animation
    ui.card.classList.add('shake');
  }
  function onPinInput() {
    ui.pin.value = ui.pin.value.replace(/\D/g, '');
    ui.err.textContent = '';
    if (s && ui.pin.value.length === s.pinLength) tryPin();
  }
  function onPinKey(e) {
    if (e.key !== 'Enter') return;
    if (V.validPin(ui.pin.value)) tryPin();
    else ui.err.textContent = 'Enter your 4 to 8 digit PIN.';
  }
  // While locked, keep keys away from the page: its shortcuts, typing, Enter on a link, Cmd/Ctrl+P.
  // Keys typed in the PIN box cross the shadow root too, so they stop here as well (the page's scripts
  // would otherwise see every PIN digit and run their shortcuts), and the PIN box is handled from here.
  for (const type of ['keydown', 'keyup', 'keypress', 'beforeinput', 'textInput', 'input']) { // textInput: Chrome's own, also carries each digit
    addEventListener(type, (e) => {
      if (!locked()) return;
      e.stopImmediatePropagation();
      if (e.target === host) {
        if (type === 'keydown' && (e.ctrlKey || e.metaKey)) e.preventDefault(); // e.g. Cmd/Ctrl+S, +P, +C
        if (type === 'keydown') onPinKey(e);
        if (type === 'input') onPinInput();
      } else if (type === 'keydown' && e.key !== 'Tab') e.preventDefault(); // Tab can still reach the PIN box
    }, true);
  }

  // ---------- blur when you leave ----------
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && s && s.blurOnLeave) { away = true; render(); }
  });
  for (const type of ['pointermove', 'pointerdown', 'keydown']) {
    addEventListener(type, () => { if (away && !document.hidden) { away = false; render(); } }, true);
  }

  // ---------- hiding chats ----------
  let lastRightClick = null;
  addEventListener('contextmenu', (e) => { lastRightClick = e.target; }, true);

  async function hide(id, title) {
    const { hiddenChats } = await V.load();
    await V.save({ hiddenChats: { ...hiddenChats, [id]: title } });
    toast('Chat hidden'); // never the title: this toast sits above the Present and step-away blur
  }

  function currentChat() {
    const id = V.chatIdFromHref(location.pathname);
    if (!id) return null;
    const link = [...document.querySelectorAll(site.side)].find((el) => chatOf(el).id === id);
    const title = link ? chatOf(link).title : clean(document.title.replace(/\s*[-|–]\s*(Claude|ChatGPT|Gemini)\s*$/i, ''));
    return { id, title };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg.type === 'status') {
      reply({ site: site.name, missing: ['side', 'input'].filter((a) => !document.querySelector(site[a])), chat: currentChat() });
    } else if (msg.type === 'hide-chat') {
      const el = lastRightClick instanceof Element && lastRightClick.closest(site.side);
      if (el) { const c = chatOf(el); hide(c.id, c.title); }
      else toast('Right-click a chat in the sidebar to hide it.');
    } else if (msg.type === 'hide-current') {
      const c = currentChat();
      if (c) hide(c.id, c.title);
    }
  });

  // ---------- Veil was updated or removed ----------
  // Chrome doesn't put the new version into tabs that are already open, and this copy can no longer
  // hear Lockdown or setting changes. Fail closed: cover the page until the tab is reloaded.
  const orphanCheck = setInterval(() => {
    if (chrome.runtime?.id) return;
    clearInterval(orphanCheck);
    orphaned = true;
    ui.veil.hidden = false;
    html.setAttribute('data-veil-cover', '');
    ui.err.textContent = 'Veil was updated. Reload this tab.';
    clearTimeout(toastTimer);
    ui.toast.textContent = 'Veil was updated. Reload this tab to keep it protected.';
    ui.toast.hidden = false;
  }, 1000);

  // ---------- storage ----------
  // storage.session needs the background worker to have opened it to content scripts; wake it and retry once.
  const wake = () => chrome.runtime.sendMessage({ type: 'wake' }).catch(() => {});
  const sessionGet = () => V.loadSession().catch(async () => { await wake(); return V.loadSession().catch(() => sess); });
  const sessionSet = (patch) => chrome.storage.session.set(patch).catch(async () => { await wake(); return chrome.storage.session.set(patch); });

  Promise.all([V.load(), sessionGet()]).then(([a, b]) => { s = a; sess = b; render(); });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (!s) return;
    if (area === 'local') for (const k in changes) s[k] = changes[k].newValue ?? V.DEFAULTS[k];
    if (area === 'session') {
      for (const k in changes) sess[k] = changes[k].newValue;
      if (changes.awayAt && changes.awayAt.newValue) away = true;
    }
    render();
  });
})();
