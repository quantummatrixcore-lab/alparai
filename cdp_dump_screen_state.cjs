const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const apTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!apTab) return;

    const ws = new WebSocket(apTab.webSocketDebuggerUrl);
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
      const dump = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          (() => {
            const modals = Array.from(document.querySelectorAll('.modal, .ui-dialog, .k-window, div[role="dialog"]')).map(m => m.innerText.substring(0, 300));
            return {
              textSnippet: document.body.innerText.substring(0, 1500),
              modals: modals
            };
          })()
        `,
        returnByValue: true
      });
      console.log(JSON.stringify(dump?.result?.value, null, 2));
      ws.close();
    });
  });
});
