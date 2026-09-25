const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/382902FAC08962E2FA9B316F23FAA8E0');

function evalJs(code) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === id) {
        ws.removeListener('message', handler);
        resolve(parsed.result?.result?.value);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
  });
}

ws.on('open', async () => {
  const info = await evalJs(`
    (function() {
      return {
        subject: document.querySelector('#_subject')?.value,
        to: document.querySelector('#_to')?.value,
        cc: document.querySelector('#_cc')?.value,
        attachments: Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => li.innerText.trim())
      };
    })()
  `);
  console.log('CURRENT COMPOSE STATE:', JSON.stringify(info, null, 2));
  ws.close();
});
