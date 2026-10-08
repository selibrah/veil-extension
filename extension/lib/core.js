// Shared by content script, popup, options, background and Node tests.
// Classic script on purpose: content scripts can't be ES modules.
(() => {
  const AREAS = ['side', 'conv', 'input', 'img'];
  const MODES = ['off', 'private', 'present', 'custom'];
  const PRESETS = { off: [], private: ['side', 'img'], present: AREAS };

  const DEFAULTS = {
    mode: 'private',
    custom: ['side', 'img'],
    strength: 6,
    hoverReveal: true,
    blurOnLeave: true,
    idleMinutes: 5, // 0 = never
    hiddenChats: {}, // chatId -> title at the time it was hidden
    keywords: [],
    pinHash: '',
    pinSalt: '',
    pinLength: 0, // lets the lock screen submit as soon as the last digit is typed
    pinFails: 0,
    pinLastFail: 0,
    panicPrev: 'private',
  };

  const areasFor = (s) => (s.mode === 'custom' ? s.custom : PRESETS[s.mode] || []);
  const nextMode = (m) => MODES[(MODES.indexOf(m) + 1) % MODES.length];

  // Panic jumps to Present; pressing it again returns to the previous mode.
  const panic = (s) =>
    s.mode === 'present'
      ? { mode: s.panicPrev && s.panicPrev !== 'present' ? s.panicPrev : 'private' }
      : { mode: 'present', panicPrev: s.mode };

  // ChatGPT /c/<id> (also /g/<gpt>/c/<id>), Claude /chat/<id>, Gemini /app/<id>
  const chatIdFromHref = (href) => (String(href || '').match(/\/(?:c|chat|app)\/([\w-]+)/) || [])[1] || '';

  const isHiddenChat = (id, title, s) =>
    (!!id && Object.hasOwn(s.hiddenChats, id)) ||
    s.keywords.some((k) => k && title.toLowerCase().includes(k.toLowerCase()));

  const MAX_FAILS = 5;
  const LOCKOUT_MS = 30_000;
  const lockoutLeft = (s, now = Date.now()) =>
    s.pinFails >= MAX_FAILS ? Math.max(0, s.pinLastFail + LOCKOUT_MS - now) : 0;

  const validPin = (pin) => /^\d{4,8}$/.test(pin);

  const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));

  // ponytail: PBKDF2 on a 4-8 digit PIN is a speed bump, not real crypto. The lock deters
  // shoulder-surfers; anyone with devtools on this machine can get around it anyway.
  async function hashPin(pin, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 200_000 },
      key,
      256,
    );
    return hex(new Uint8Array(bits));
  }

  // ---- chrome.* helpers (not exercised by Node tests) ----
  const load = () => chrome.storage.local.get(DEFAULTS);
  const save = (patch) => chrome.storage.local.set(patch);
  const loadSession = () => chrome.storage.session.get({ unlocked: false, showHidden: false, awayAt: 0 });
  const isLocked = (s, sess) => !!s.pinHash && !sess.unlocked;

  async function setPin(pin) {
    const pinSalt = newSalt();
    await save({ pinSalt, pinHash: await hashPin(pin, pinSalt), pinLength: pin.length, pinFails: 0 });
    await chrome.storage.session.set({ unlocked: true });
  }

  async function removePin() {
    await save({ pinHash: '', pinSalt: '', pinLength: 0, pinFails: 0 });
  }

  // -> { ok: true } | { ok: false, wait: msUntilNextTry }
  async function checkPin(pin) {
    const s = await load();
    const wait = lockoutLeft(s);
    if (wait) return { ok: false, wait };
    if ((await hashPin(pin, s.pinSalt)) === s.pinHash) {
      await save({ pinFails: 0 });
      return { ok: true };
    }
    const failed = { pinFails: s.pinFails + 1, pinLastFail: Date.now() };
    await save(failed);
    return { ok: false, wait: lockoutLeft({ ...s, ...failed }) };
  }

  const VeilCore = {
    AREAS, MODES, PRESETS, DEFAULTS, MAX_FAILS, LOCKOUT_MS,
    areasFor, nextMode, panic, chatIdFromHref, isHiddenChat, lockoutLeft, validPin, hashPin, newSalt,
    load, save, loadSession, isLocked, setPin, removePin, checkPin,
  };
  if (typeof module === 'object' && module.exports) module.exports = VeilCore;
  else globalThis.VeilCore = VeilCore;
})();
