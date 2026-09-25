/**
 * scripts/click_edit_dns.cjs
 * Clicks Edit on alparai.com A record and inspects the form controls.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  const clickScript = `(() => {
    const btn = document.querySelector('button[aria-label="Edit A record with name alparai.com"]');
    if (btn) {
      btn.click();
      return { clicked: true };
    }
    return { clicked: false };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: clickScript, returnByValue: true }
  }));

  await sleep(1500);

  const inspectScript = `(() => {
    // Look for form controls that appeared
    const inputs = Array.from(document.querySelectorAll('input, select, [role="switch"], [role="checkbox"], button')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      role: el.getAttribute('role') || '',
      name: el.name || '',
      id: el.id || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      ariaChecked: el.getAttribute('aria-checked') || '',
      checked: el.checked || false,
      text: el.innerText.trim(),
      value: el.value || ''
    })).filter(el => {
      const s = (el.ariaLabel + el.name + el.id + el.text + el.value).toLowerCase();
      return s.includes('prox') || s.includes('save') || s.includes('cancel') || s.includes('45.143');
    });

    return {
      inputs
    };
  })()`;

  ws.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: { expression: inspectScript, returnByValue: true }
  }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 2) {
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
