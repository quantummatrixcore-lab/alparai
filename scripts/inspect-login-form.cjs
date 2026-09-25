const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

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
      const inputs = await evalJs(`
        (function() {
          const form = document.querySelector('form');
          return {
            formAction: form ? form.action : '',
            inputs: Array.from(document.querySelectorAll('input, button')).map(i => ({
              tag: i.tagName,
              type: i.type,
              name: i.name,
              id: i.id,
              class: i.className,
              text: i.innerText || i.value
            }))
          };
        })()
      `);

      console.log('Login form elements:', JSON.stringify(inputs, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
