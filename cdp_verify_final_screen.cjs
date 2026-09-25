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
      const check = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          ({
            to: document.getElementById('_to')?.value,
            cc: document.getElementById('_cc')?.value,
            subject: document.getElementById('_subject')?.value,
            bodyLen: (document.getElementById('_message')?.value || '').length,
            attachCount: document.querySelectorAll('#attachment-list li, .attachmentslist li').length
          })
        `,
        returnByValue: true
      });
      console.log('Final Compose Screen Check:', check?.result?.value);
      ws.close();
    });
  });
});
