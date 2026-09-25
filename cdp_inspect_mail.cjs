const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/6C7E134411C702CD8A8774FDA1FC8290');

ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        fetch('https://purelymail.com/manage/welcome', { credentials: 'include' })
          .then(r => r.text().then(t => ({ status: r.status, url: r.url, length: t.length, snippet: t.slice(0, 1000) })))
          .catch(err => ({ error: err.message }))
      `,
      awaitPromise: true,
      returnByValue: true
    }
  }));
});

ws.on('message', (msg) => {
  const resp = JSON.parse(msg);
  if (resp.id === 1) {
    console.log(JSON.stringify(resp.result?.result?.value, null, 2));
    ws.close();
  }
});
