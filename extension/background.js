// Service worker: keyboard shortcuts, idle auto-lock, right-click "Hide this chat".
importScripts('lib/core.js');
const V = globalThis.VeilCore;
const SITES = ['https://chatgpt.com/*', 'https://claude.ai/*', 'https://gemini.google.com/*'];

// Let content scripts read the lock state. Session storage is wiped when Chrome restarts, which is what re-locks it.
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
chrome.runtime.onStartup.addListener(() => {}); // start the worker with Chrome so the line above runs early
chrome.runtime.onMessage.addListener((msg, _sender, reply) => { if (msg.type === 'wake') reply(true); });

chrome.runtime.onInstalled.addListener(({ reason }) => {
  chrome.contextMenus.removeAll(() =>
    chrome.contextMenus.create({ id: 'hide-chat', title: 'Hide this chat (Veil)', contexts: ['all'], documentUrlPatterns: SITES }));
  if (reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#welcome') });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'hide-chat' && tab && tab.id >= 0) {
    chrome.tabs.sendMessage(tab.id, { type: 'hide-chat' }, { frameId: 0 }).catch(() => {});
  }
});

const lockNow = () => chrome.storage.session.set({ unlocked: false, showHidden: false });

chrome.commands.onCommand.addListener(async (command) => {
  const s = await V.load();
  if (command === 'panic') V.save(V.panic(s));
  else if (command === 'cycle') V.save({ mode: V.nextMode(s.mode), panicPrev: '' }); // a manual change ends any panic
  else if (command === 'lock') s.pinHash ? lockNow() : chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html#pin') });
});

// Away from the computer: lock if there's a PIN, otherwise blur.
async function setIdleInterval() {
  const { idleMinutes } = await V.load();
  chrome.idle.setDetectionInterval(Math.max(15, (idleMinutes || 30) * 60));
}
setIdleInterval();
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.idleMinutes) setIdleInterval(); });

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'active') return;
  const s = await V.load();
  if (!s.idleMinutes) return;
  if (s.pinHash) lockNow();
  else chrome.storage.session.set({ awayAt: Date.now() });
});
