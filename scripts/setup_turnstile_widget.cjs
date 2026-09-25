/**
 * scripts/setup_turnstile_widget.cjs
 * Navigates to Turnstile, clicks 'Add widget manually', and inspects the creation form.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  console.log('Navigating to Turnstile...');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/turnstile' }
  }));

  await sleep(3500);

  console.log('Clicking "Add widget manually"...');
  const clickAdd = `(() => {
    const btn = Array.from(document.querySelectorAll('button, a[role="button"], a')).find(el => {
      const text = el.innerText.trim();
      return text.includes('Add widget manually') || text.includes('Add widget') || text.includes('Add site');
    });
    if (btn) {
      btn.click();
      return { clicked: true, text: btn.innerText.trim() };
    }
    return { clicked: false };
  })()`;

  ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: clickAdd, returnByValue: true } }));
  await sleep(2500);

  // Inspect form controls
  const inspectForm = `(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      id: el.id || '',
      placeholder: el.placeholder || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      value: el.value || '',
      text: el.innerText.trim()
    }));

    const text = document.body.innerText.slice(0, 2000);

    return {
      inputs,
      text
    };
  })()`;

  ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: inspectForm, returnByValue: true } }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 3) {
    console.log('--- TURNSTILE CREATION FORM ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
