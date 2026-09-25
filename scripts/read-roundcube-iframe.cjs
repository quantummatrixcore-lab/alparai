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
      console.log('Reading Roundcube iframe content...');
      const iframeText = await evalJs(`
        (function() {
          const iframe = document.querySelector('#messagecontframe, iframe#rcmmailbearer, iframe');
          if (iframe) {
            try {
              const doc = iframe.contentDocument || iframe.contentWindow.document;
              return {
                found: true,
                text: doc.body.innerText.slice(0, 1000),
                html: doc.body.innerHTML.slice(0, 1000)
              };
            } catch(e) {
              return { found: true, error: e.message };
            }
          }
          return { found: false };
        })()
      `);

      console.log('Roundcube iframe content:', JSON.stringify(iframeText, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
