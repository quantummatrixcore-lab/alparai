const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const mailTab = tabs.find(t => t.url && t.url.includes('purelymail.com') && t.url.includes('_task=mail') && t.url.includes('_action=compose'));
    if (!mailTab) return;

    const ws = new WebSocket(mailTab.webSocketDebuggerUrl);
    function sendCmd(id, method, params = {}) {
      return new Promise((resolve) => {
        const handler = (msg) => {
          const resp = JSON.parse(msg);
          if (resp.id === id) {
            ws.removeListener('message', handler);
            resolve(resp.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.on('open', async () => {
      const inspect = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          (() => {
            const inputs = Array.from(document.querySelectorAll('input, textarea')).map(el => ({
              tag: el.tagName,
              id: el.id,
              name: el.name,
              value: el.value.substring(0, 50)
            }));
            const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
              id: f.id,
              name: f.name
            }));
            return { inputs, iframes };
          })()
        `,
        returnByValue: true
      });
      console.log('Compose Form Elemanları:', JSON.stringify(inspect?.result?.value, null, 2));
      ws.close();
    });
  });
});
