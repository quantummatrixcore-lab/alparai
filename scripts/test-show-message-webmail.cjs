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
      console.log('Navigating directly to Roundcube show message page (UID 24)...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=mail&_mbox=INBOX&_uid=24&_action=show' } }));

      await new Promise(r => setTimeout(r, 3000));

      const pageText = await evalJs('document.body.innerText');
      console.log('=== SHOW MESSAGE PAGE TEXT ===');
      console.log(pageText.slice(0, 2000));

      const iframeContent = await evalJs(`
        (function() {
          const f = document.querySelector('iframe');
          if (f) {
            try {
              const doc = f.contentDocument || f.contentWindow.document;
              return { found: true, text: doc.body.innerText.slice(0, 1000), html: doc.body.innerHTML.slice(0, 1000) };
            } catch(e) {
              return { found: true, error: e.message };
            }
          }
          return { found: false };
        })()
      `);

      console.log('Iframe content:', JSON.stringify(iframeContent, null, 2));

      ws.close();
      process.exit(0);
    });
  });
});
