const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(b => (b.innerText || '').includes('Add widget manually'));
    return btn ? {
      tag: btn.tagName,
      href: btn.href || null,
      outerHTML: btn.outerHTML
    } : null;
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: code, returnByValue: true }
  }));
});

ws.on('message', (d) => {
  console.log(JSON.stringify(JSON.parse(d).result?.result?.value, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
