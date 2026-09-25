const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const purelyTab = tabs.find(t => t.url && t.url.includes('purelymail.com/manage'));
    if (!purelyTab) {
      console.log('Purelymail tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(purelyTab.webSocketDebuggerUrl);

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
      console.log('Clicking Create new user button...');
      const clickRes = await evalJs(`
        (function() {
          const btns = Array.from(document.querySelectorAll('button, a, div, span'));
          const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Create new user');
          if (btn) {
            btn.click();
            return 'clicked';
          }
          return 'btn_not_found';
        })()
      `);

      console.log('Click result:', clickRes);

      await new Promise(r => setTimeout(r, 1500));

      const formHtml = await evalJs(`
        (function() {
          const main = document.querySelector('main') || document.body;
          return main.innerHTML;
        })()
      `);

      console.log('=== FORM HTML AFTER CLICK ===');
      console.log(formHtml.slice(0, 3500));

      ws.close();
      process.exit(0);
    });
  });
});
