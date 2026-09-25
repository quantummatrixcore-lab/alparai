const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const text = document.querySelector('main')?.innerText || document.body.innerText;
    const match = text.match(/(?:Your SSL\\/TLS encryption mode is|SSL\\/TLS encryption mode is)\\s*([A-Za-z\\s()]+)/i);
    const checked = document.querySelector('input[type="radio"]:checked')?.parentElement?.innerText?.trim();
    return {
      match: match ? match[0] : null,
      checkedOption: checked || null,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean).slice(0, 10)
    };
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
