const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  console.log('Focusing and clicking Combobox.Input...');

  const focusScript = `(() => {
    // 1. Set widget name via React setter
    const nameInput = document.querySelector('input[name="name"]');
    if (nameInput) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(nameInput, 'ALPAR AI Platform');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 2. Click Combobox input
    const combobox = document.querySelector('[role="combobox"]');
    if (combobox) {
      combobox.focus();
      combobox.click();
      return { focused: true };
    }
    return { focused: false };
  })()`;

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: focusScript, returnByValue: true } }));
  await sleep(1500);

  // Check what options appeared in the DOM
  const checkOptions = `(() => {
    const options = Array.from(document.querySelectorAll('[role="option"], [data-kumo-component*="Option"], [role="listbox"] *')).map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role') || '',
      text: el.innerText.trim()
    })).filter(o => o.text.length > 0 && o.text.length < 50);

    return {
      options
    };
  })()`;

  ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: checkOptions, returnByValue: true } }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 2) {
    console.log('--- COMBOBOX OPTIONS ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
