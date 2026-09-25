const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  console.log('Clicking "Add widget manually" button...');

  const clickScript = `(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('Add widget manually'));
    if (btn) {
      btn.click();
      return { clicked: true };
    }
    return { clicked: false };
  })()`;

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: clickScript, returnByValue: true } }));

  await sleep(3000);

  const inspect = `(() => {
    const url = window.location.href;
    const title = document.title;
    const inputs = Array.from(document.querySelectorAll('input, select, textarea, [role="radio"]')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      id: el.id || '',
      placeholder: el.placeholder || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      value: el.value || '',
      text: el.innerText ? el.innerText.trim() : ''
    }));
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim()).filter(Boolean);
    const textSnippet = (document.querySelector('main') || document.body).innerText.slice(0, 2000);

    return {
      url,
      title,
      headings,
      inputs,
      textSnippet
    };
  })()`;

  ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: inspect, returnByValue: true } }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 2) {
    console.log('--- ADD WIDGET RESULT ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
