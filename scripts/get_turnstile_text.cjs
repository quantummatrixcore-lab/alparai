const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const main = document.querySelector('main');
    const text = (main ? main.innerText : document.body.innerText) || '';
    const keys = text.match(/0x4[A-Za-z0-9_]{15,}/g);
    const rows = Array.from(document.querySelectorAll('table tr')).map(r => r.innerText.trim());
    return {
      keys: keys ? Array.from(new Set(keys)) : [],
      rows,
      textSample: text.slice(0, 1500)
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
