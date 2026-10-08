// PIN entry used by the popup and settings page. Calls onOk() after the right PIN.
// Submits on its own once the PIN's length is reached; Enter also submits.
function pinInput(onOk) {
  const V = globalThis.VeilCore;
  const wrap = document.createElement('div');
  wrap.innerHTML = '<input class="field pin" type="password" inputmode="numeric" autocomplete="off" maxlength="8" aria-label="PIN" placeholder="••••"><div class="err" role="alert"></div>';
  const [input, err] = wrap.children;
  let busy = false;

  async function submit() {
    if (busy) return;
    if (!V.validPin(input.value)) return (err.textContent = 'Enter your 4 to 8 digit PIN.');
    busy = true;
    const r = await V.checkPin(input.value);
    busy = false;
    input.value = '';
    if (r.ok) return onOk();
    err.textContent = r.wait ? `Too many tries. Wait ${Math.ceil(r.wait / 1000)}s.` : 'Wrong PIN. Try again.';
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
  }

  input.addEventListener('input', async () => {
    input.value = input.value.replace(/\D/g, '');
    err.textContent = '';
    const { pinLength } = await V.load();
    if (input.value.length === pinLength) submit();
  });
  input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
  setTimeout(() => input.focus());
  return wrap;
}
