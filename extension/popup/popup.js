const V = globalThis.VeilCore;
const $ = (id) => document.getElementById(id);
const LABELS = { side: 'chat list', input: 'input box' };
let s, sess, status, tabId;

const setSession = (patch) => chrome.storage.session.set(patch);
const openSettings = (hash = '') => {
  chrome.tabs.create({ url: chrome.runtime.getURL(`options/options.html${hash}`) });
  window.close();
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function render() {
  const locked = V.isLocked(s, sess);
  $('locked').hidden = !locked;
  $('controls').hidden = locked;

  const pill = $('status');
  pill.className = 'pill';
  pill.title = '';
  if (locked) pill.textContent = 'Locked';
  else if (!status) pill.textContent = 'Not on this site';
  else if (s.mode === 'off') pill.textContent = `${status.site} · Off`;
  else if (status.missing.length) {
    pill.textContent = 'Check layout';
    pill.classList.add('warn');
    pill.title = `Couldn't find the ${status.missing.map((a) => LABELS[a]).join(' or ')} here. If the sidebar is open and has chats, ${status.site} may have changed its design.`;
  } else {
    pill.textContent = `${status.site} · Armed`;
    pill.classList.add('ok');
  }

  if (locked) {
    if (!$('unlock').firstChild) $('unlock').append(pinInput(() => setSession({ unlocked: true })));
    return;
  }

  $('offsite').hidden = !!status;
  for (const b of document.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', b.dataset.mode === s.mode);
  const areas = V.areasFor(s);
  for (const b of document.querySelectorAll('[data-area]')) b.setAttribute('aria-checked', areas.includes(b.dataset.area));
  $('strength').value = s.strength;
  $('strength-val').textContent = `${s.strength}px`;
  $('hover').setAttribute('aria-checked', s.hoverReveal);

  const n = Object.keys(s.hiddenChats).length;
  const k = s.keywords.length;
  $('hidden-count').textContent = n || k ? [n && `${plural(n, 'chat')} hidden`, k && plural(k, 'keyword')].filter(Boolean).join(' + ') : 'No hidden chats';
  $('show-hidden').hidden = !(n || k);
  $('show-hidden').textContent = sess.showHidden ? 'Hide' : 'Show';

  const chat = status && status.chat;
  $('hide-open-row').hidden = !chat || V.isHiddenChat(chat.id, chat.title, s);
}

// A manual mode change ends any panic, so the panic key can't later "undo" back to an old mode such as Off.
for (const b of document.querySelectorAll('[data-mode]')) b.onclick = () => V.save({ mode: b.dataset.mode, panicPrev: '' });
for (const b of document.querySelectorAll('[data-area]')) {
  b.onclick = () => {
    const on = new Set(V.areasFor(s));
    on.has(b.dataset.area) ? on.delete(b.dataset.area) : on.add(b.dataset.area);
    V.save({ mode: 'custom', custom: V.AREAS.filter((a) => on.has(a)), panicPrev: '' });
  };
}
$('strength').oninput = (e) => V.save({ strength: Number(e.target.value) });
$('hover').onclick = () => V.save({ hoverReveal: !s.hoverReveal });

$('show-hidden').onclick = () => {
  const row = $('show-pin');
  if (sess.showHidden) return setSession({ showHidden: false });
  if (!s.pinHash) return setSession({ showHidden: true });
  if (!row.hidden) return (row.hidden = true);
  row.replaceChildren(pinInput(() => { row.hidden = true; setSession({ showHidden: true }); }));
  row.hidden = false;
};
$('hide-open').onclick = () => chrome.tabs.sendMessage(tabId, { type: 'hide-current' }).catch(() => {});

$('lockdown').onclick = () => {
  if (!s.pinHash) return openSettings('#pin');
  setSession({ unlocked: false, showHidden: false });
  window.close();
};
$('settings').onclick = () => openSettings();

chrome.storage.onChanged.addListener((changes, area) => {
  const target = area === 'local' ? s : area === 'session' ? sess : null;
  if (!target) return;
  for (const key in changes) target[key] = changes[key].newValue ?? (area === 'local' ? V.DEFAULTS[key] : false);
  render();
});

(async () => {
  [s, sess] = await Promise.all([V.load(), V.loadSession()]);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab && tab.id;
  status = tabId >= 0 ? await chrome.tabs.sendMessage(tabId, { type: 'status' }, { frameId: 0 }).catch(() => null) : null;
  render();

  const keys = Object.fromEntries((await chrome.commands.getAll()).map((c) => [c.name, c.shortcut]));
  $('shortcuts').textContent = [keys.panic && `${keys.panic} panic blur`, keys.lock && `${keys.lock} lock`].filter(Boolean).join(' · ') || 'Set shortcuts in Settings';
})();
