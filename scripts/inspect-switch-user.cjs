const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
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
      console.log('Clicking Switch User link...');
      const res = await evalJs(`
        (function() {
          const els = Array.from(document.querySelectorAll('a, button, span, div'));
          const su = els.find(e => e.innerText && e.innerText.trim() === 'Switch User');
          if (su) {
            su.click();
            return { clicked: true, text: su.innerText, href: su.href };
          }
          return { clicked: false };
        })()
      `);

      console.log('Switch User result:', res);

      await new Promise(r => setTimeout(r, 2000));

      const pageText = await evalJs('document.body.innerText');
      console.log('=== PAGE TEXT AFTER SWITCH USER ===');
      console.log(pageText.slice(0, 1500));

      ws.close();
      process.exit(0);
    });
  });
});
