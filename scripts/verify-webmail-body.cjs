const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('inbox.purelymail.com')) || tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
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
      console.log('Reloading Purelymail Webmail tab...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.reload' }));

      await new Promise(r => setTimeout(r, 3500));

      console.log('Clicking top Teknopark email in list...');
      const clickRes = await evalJs(`
        (function() {
          const rows = Array.from(document.querySelectorAll('tr, td, span, a')).filter(e => e.innerText && e.innerText.includes('TEKNOPARK'));
          if (rows.length > 0) {
            rows[0].click();
            return { clicked: true, text: rows[0].innerText.slice(0, 100) };
          }
          return { clicked: false };
        })()
      `);

      console.log('Click result:', clickRes);

      await new Promise(r => setTimeout(r, 2000));

      const messageContent = await evalJs(`
        (function() {
          const bodyEl = document.querySelector('#messagebody, .message-htmlpart, iframe, #message-container') || document.body;
          return {
            textSnippet: bodyEl.innerText ? bodyEl.innerText.slice(0, 1500) : '',
            htmlSnippet: bodyEl.innerHTML ? bodyEl.innerHTML.slice(0, 2000) : ''
          };
        })()
      `);

      console.log('=== VERIFIED EMAIL BODY CONTENT ===');
      console.log(messageContent.textSnippet);

      ws.close();
      process.exit(0);
    });
  });
});
