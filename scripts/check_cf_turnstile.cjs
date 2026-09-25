const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/turnstile' }
  }));

  await sleep(4000);

  const script = `(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr, [role=\"row\"]')).map(r => {
      return Array.from(r.querySelectorAll('td, th, [role=\"cell\"]')).map(c => c.innerText.trim());
    }).filter(r => r.length >= 2);

    const text = document.body.innerText || '';
    const siteKeys = text.match(/(0x4[A-Za-z0-9_]{15,})/g);

    return {
      title: document.title,
      rows: rows.slice(0, 10),
      siteKeys: siteKeys ? Array.from(new Set(siteKeys)) : [],
      textSnippet: text.slice(0, 1500)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: { expression: script, returnByValue: true }
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
