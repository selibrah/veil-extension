const V = globalThis.VeilCore;
const $ = (id) => document.getElementById(id);
let s;

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}
const note = (text) => el('p', { className: 'hint', textContent: text, style: 'margin:0' });

function render() {
  const hidden = Object.entries(s.hiddenChats);
  $('hidden-list').replaceChildren(...(hidden.length ? hidden.map(([id, title]) =>
    el('div', { className: 'row' },
      el('span', { className: 'grow', textContent: title || 'Untitled chat' }),
      el('button', {
        className: 'btn quiet', textContent: 'Unhide',
        onclick: () => { const next = { ...s.hiddenChats }; delete next[id]; V.save({ hiddenChats: next }); },
      }))) : [note('No hidden chats yet.')]));

  $('kw-list').replaceChildren(...s.keywords.map((k) =>
    el('span', { className: 'chip' }, k,
      el('button', {
        title: `Remove “${k}”`, ariaLabel: `Remove ${k}`, innerHTML: '<svg class="i" aria-hidden="true"><use href="../ui/icons.svg#x"/></svg>',
        onclick: () => V.save({ keywords: s.keywords.filter((x) => x !== k) }),
      }))));

  $('pin-state').textContent = s.pinHash
    ? 'Your PIN is on. Lockdown, auto-lock, hidden chats and this page use it.'
    : 'Set a PIN to use Lockdown and auto-lock, and to protect your hidden chats.';
  $('pin-save').textContent = s.pinHash ? 'Change PIN' : 'Set PIN';
  $('pin-remove').hidden = !s.pinHash;
  $('idle').value = String(s.idleMinutes);
  $('leave').setAttribute('aria-checked', s.blurOnLeave);
}

$('kw-form').onsubmit = (e) => {
  e.preventDefault();
  const k = $('kw').value.trim();
  if (k && !s.keywords.some((x) => x.toLowerCase() === k.toLowerCase())) V.save({ keywords: [...s.keywords, k] });
  $('kw').value = '';
};

$('pin-form').onsubmit = async (e) => {
  e.preventDefault();
  const [a, b, err] = [$('pin1').value, $('pin2').value, $('pin-err')];
  err.className = 'err';
  if (!V.validPin(a)) return (err.textContent = 'Use 4 to 8 digits.');
  if (a !== b) return (err.textContent = "The PINs don't match.");
  await V.setPin(a);
  $('pin1').value = $('pin2').value = '';
  err.className = 'err ok';
  err.textContent = 'PIN saved.';
};
for (const id of ['pin1', 'pin2']) $(id).oninput = (e) => { e.target.value = e.target.value.replace(/\D/g, ''); $('pin-err').textContent = ''; };
$('pin-remove').onclick = () => {
  if (confirm('Remove your PIN? Lockdown and auto-lock will stop working.')) V.removePin();
};

$('idle').onchange = (e) => V.save({ idleMinutes: Number(e.target.value) });
$('leave').onclick = () => V.save({ blurOnLeave: !s.blurOnLeave });
$('change-keys').onclick = () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !s) return;
  for (const k in changes) s[k] = changes[k].newValue ?? V.DEFAULTS[k];
  render();
});

function showContent() {
  $('gate').hidden = true;
  $('content').hidden = false;
  render();
  if (location.hash === '#pin') {
    $('pin').scrollIntoView({ block: 'center' });
    $('pin1').focus();
  }
}

(async () => {
  s = await V.load();
  $('welcome').hidden = location.hash !== '#welcome';
  if (s.pinHash) {
    $('gate-pin').append(pinInput(showContent));
    $('gate').hidden = false;
  } else showContent();

  const cmds = await chrome.commands.getAll();
  $('keys').replaceChildren(...cmds.filter((c) => c.description).map((c) =>
    el('div', { className: 'row' }, el('span', { className: 'grow', textContent: c.description }), el('span', { className: 'kbd', textContent: c.shortcut || 'Not set' }))));
})();
