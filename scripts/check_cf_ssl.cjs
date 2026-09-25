const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: {
      url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/alparai.com/ssl-tls'
    }
  }));

  await sleep(4000);

  const script = `(() => {
    const text = document.body.innerText || '';
    const mode = text.match(/(Off|Flexible|Full \\(strict\\)|Full)/i);
    const radioSelected = Array.from(document.querySelectorAll('input[type=\"radio\"]:checked')).map(r => r.value || r.parentElement?.innerText?.trim());
    return {
      title: document.title,
      sslDetected: mode ? mode[0] : 'N/A',
      selectedRadio: radioSelected,
      textSnippet: text.slice(0, 1500)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: { expression: script, returnByValue: true }
  }));
});

ws.on('message', (raw) => {
  const res = JSON.parse(raw);
  if (res.id === 2) {
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
