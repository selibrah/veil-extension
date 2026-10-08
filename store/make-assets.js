// Builds the Chrome Web Store images and the website images from the real e2e screenshots.
// Run: npm run assets   (runs the e2e test with SHOTS=.shots first)
// Output is JPEG because the store rejects images with an alpha channel.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const data = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(ROOT, file)).toString('base64')}`;
const shot = (name) => data(`.shots/${name}.png`, 'image/png');
const font = (file) => data(`extension/fonts/${file}`, 'font/woff2');
const ICON = data('extension/icons/icon128.png', 'image/png');

const BASE = `<style>
@font-face { font-family: Bangers; src: url(${font('Bangers.woff2')}); }
@font-face { font-family: Jakarta; src: url(${font('PlusJakartaSans.woff2')}); font-weight: 500 800; }
* { box-sizing: border-box; margin: 0; }
body { width: var(--w); height: var(--h); overflow: hidden; position: relative; font: 700 26px/1.3 Jakarta, sans-serif; color: #0c101a;
  background: radial-gradient(rgba(12,16,26,.13) 2px, transparent 2.5px) 0 0 / 22px 22px, var(--bg); }
h1 { font: 76px/1 Bangers, sans-serif; letter-spacing: .04em; }
.panel { position: absolute; overflow: hidden; background: #fff; border: 5px solid #0c101a; border-radius: 16px; box-shadow: 12px 12px 0 #0c101a; }
.panel img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top left; }
.logo { width: 128px; height: 128px; }
</style>`;

const frame = ({ bg, color = '#0c101a', title, sub, img, extra = '' }) => `${BASE}
<body style="--w:1280px; --h:800px; --bg:${bg}; color:${color}">
  <div style="position:absolute; left:64px; top:52px; right:64px">
    <h1>${title}</h1><p style="margin-top:10px">${sub}</p>
  </div>
  <div class="panel" style="left:64px; top:228px; width:860px; height:538px"><img src="${img}"></div>
  ${extra}
</body>`;

const PAGES = {
  'store/screenshot-1-private': frame({
    bg: '#fed130', title: 'Blur the private stuff. Keep working.',
    sub: 'Your chat list and images stay blurred. Hover to peek at one.',
    img: shot('private'),
    extra: `<div class="panel" style="left:900px; top:150px; width:316px; height:618px; transform:rotate(2deg)"><img src="${shot('popup')}"></div>`,
  }),
  'store/screenshot-2-lock': frame({
    bg: '#ff3377', title: 'Lock your AI chats with a PIN',
    sub: 'Locks when you step away, and again every time Chrome restarts.',
    img: shot('lock'),
    extra: `<p style="position:absolute; left:960px; top:300px; width:260px; font-size:24px">Lockdown button<br>or <b>Alt+Shift+L</b></p>`,
  }),
  'store/screenshot-3-hide': frame({
    bg: '#19d3da', title: "Hide chats you don't want seen",
    sub: 'Right-click any chat, or hide every chat that matches a keyword.',
    img: shot('options'),
    extra: `<p style="position:absolute; left:960px; top:300px; width:260px; font-size:24px">Hidden chats are protected by your PIN too.</p>`,
  }),
  'store/screenshot-4-present': frame({
    bg: '#7952ff', color: '#fff', title: 'One key. Everything blurred.',
    sub: 'Someone walks up? Alt+Shift+B. Press it again to bring it back.',
    img: shot('present'),
    extra: `<p style="position:absolute; left:960px; top:300px; width:260px; font-size:24px">Also blurs on its own when you switch tabs.</p>`,
  }),
  'store/promo-small-440x280': `${BASE}
<body style="--w:440px; --h:280px; --bg:#fed130; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px">
  <div style="display:flex; align-items:center; gap:14px"><img class="logo" style="width:96px; height:96px" src="${ICON}"><h1 style="font-size:84px">VEIL</h1></div>
  <p style="font-size:21px">Privacy blur for AI chats</p>
</body>`,
  'store/promo-marquee-1400x560': `${BASE}
<body style="--w:1400px; --h:560px; --bg:#fed130">
  <div style="position:absolute; left:80px; top:150px">
    <div style="display:flex; align-items:center; gap:22px"><img class="logo" src="${ICON}"><h1 style="font-size:130px">VEIL</h1></div>
    <p style="margin-top:18px; font-size:30px">Blur, hide and lock<br>ChatGPT, Claude and Gemini.</p>
  </div>
  <div class="panel" style="left:640px; top:70px; width:690px; height:431px; transform:rotate(-2deg)"><img src="${shot('private')}"></div>
</body>`,
  // Link preview for the website (Open Graph / X cards).
  'site/og': `${BASE}
<body style="--w:1200px; --h:630px; --bg:#fed130">
  <div style="position:absolute; left:64px; top:70px; width:520px">
    <div style="display:flex; align-items:center; gap:18px"><img class="logo" style="width:104px; height:104px" src="${ICON}"><h1 style="font-size:110px">VEIL</h1></div>
    <p style="margin-top:22px; font-size:38px; line-height:1.2">Use AI anywhere.<br>Keep your chats private.</p>
    <p style="margin-top:22px; font-size:22px">Blur, hide and lock ChatGPT, Claude and Gemini. Free.</p>
  </div>
  <div class="panel" style="left:600px; top:110px; width:640px; height:400px; transform:rotate(-2deg)"><img src="${shot('private')}"></div>
</body>`,
};

(async () => {
  const browser = await chromium.launch({ channel: 'chromium' });
  for (const [name, html] of Object.entries(PAGES)) {
    const [, w, h] = html.match(/--w:(\d+)px; --h:(\d+)px/);
    const page = await browser.newPage({ viewport: { width: +w, height: +h } });
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, `${name}.jpg`), type: 'jpeg', quality: 92 });
    await page.close();
    console.log(`${name}.jpg  ${w}x${h}`);
  }
  await browser.close();
  for (const n of ['private', 'popup', 'lock', 'present', 'options']) fs.copyFileSync(path.join(ROOT, `.shots/${n}.png`), path.join(ROOT, `site/img/${n}.png`));
  console.log('site/img/*.png  copied from .shots');
})();
