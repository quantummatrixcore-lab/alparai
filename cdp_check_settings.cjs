const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/6C7E134411C702CD8A8774FDA1FC8290');

ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        ({
          frames: Array.from(document.querySelectorAll('iframe')).map(f => ({ id: f.id, name: f.name, src: f.src })),
          links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href, rel: a.rel, onclick: a.getAttribute('onclick') })).filter(a => a.text)
        })
      `,
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
