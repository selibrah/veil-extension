// Run: node --test test/core.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../extension/lib/core.js');

const settings = (over = {}) => ({ ...V.DEFAULTS, ...over });

test('modes map to the right areas', () => {
  assert.deepEqual(V.areasFor(settings({ mode: 'off' })), []);
  assert.deepEqual(V.areasFor(settings({ mode: 'private' })), ['side', 'img']);
  assert.deepEqual(V.areasFor(settings({ mode: 'present' })), V.AREAS);
  assert.deepEqual(V.areasFor(settings({ mode: 'custom', custom: ['conv'] })), ['conv']);
  assert.deepEqual(V.areasFor(settings({ mode: 'bogus' })), []);
});

test('cycle goes through every mode and wraps', () => {
  assert.deepEqual(['off', 'private', 'present', 'custom'].map(V.nextMode), ['private', 'present', 'custom', 'off']);
});

test('panic toggles into Present and back to where you were', () => {
  const on = V.panic(settings({ mode: 'custom' }));
  assert.deepEqual(on, { mode: 'present', panicPrev: 'custom' });
  assert.deepEqual(V.panic(settings(on)), { mode: 'custom' });
  assert.deepEqual(V.panic(settings({ mode: 'present', panicPrev: 'present' })), { mode: 'private' });
  // Present picked by hand clears panicPrev, so panic can't "undo" into an old mode such as Off.
  assert.deepEqual(V.panic(settings({ mode: 'present', panicPrev: '' })), { mode: 'private' });
});

test('chat ids come out of every supported site URL shape', () => {
  assert.equal(V.chatIdFromHref('/c/6720a1b2-aaaa-bbbb'), '6720a1b2-aaaa-bbbb');
  assert.equal(V.chatIdFromHref('https://chatgpt.com/g/g-p-123-proj/c/abc-123'), 'abc-123');
  assert.equal(V.chatIdFromHref('/chat/0f1e2d3c-4b5a'), '0f1e2d3c-4b5a');
  assert.equal(V.chatIdFromHref('/app/9a8b7c6d'), '9a8b7c6d');
  assert.equal(V.chatIdFromHref('/library'), '');
  assert.equal(V.chatIdFromHref(null), '');
});

test('chats hide by id or by keyword, case-insensitive', () => {
  const s = settings({ hiddenChats: { abc: 'Doctor results' }, keywords: ['SALARY', ''] });
  assert.equal(V.isHiddenChat('abc', 'anything', s), true);
  assert.equal(V.isHiddenChat('zzz', 'My salary talk', s), true);
  assert.equal(V.isHiddenChat('zzz', 'Trip plan', s), false);
  assert.equal(V.isHiddenChat('toString', 'Trip plan', s), false); // no prototype leaks
});

test('5 wrong PINs means a 30 second wait', () => {
  const now = 1_000_000;
  assert.equal(V.lockoutLeft(settings({ pinFails: 4, pinLastFail: now }), now), 0);
  assert.equal(V.lockoutLeft(settings({ pinFails: 5, pinLastFail: now }), now + 10_000), 20_000);
  assert.equal(V.lockoutLeft(settings({ pinFails: 5, pinLastFail: now }), now + 31_000), 0);
});

test('PIN rules and hashing', async () => {
  assert.equal(V.validPin('1234'), true);
  assert.equal(V.validPin('12345678'), true);
  assert.equal(V.validPin('123'), false);
  assert.equal(V.validPin('12a4'), false);
  const salt = V.newSalt();
  const h = await V.hashPin('1234', salt);
  assert.equal(h, await V.hashPin('1234', salt));
  assert.notEqual(h, await V.hashPin('1235', salt));
  assert.notEqual(h, await V.hashPin('1234', V.newSalt()));
});
