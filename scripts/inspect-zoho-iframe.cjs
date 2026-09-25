const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const zohoTab = tabs.find(t => t.url && t.url.includes('zoho.eu'));
    if (!zohoTab) {
      console.log('Zoho tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(zohoTab.webSocketDebuggerUrl);

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
      console.log('Checking iframe contents in Zoho tab...');
      const iframeInfo = await evalJs(`
        (function() {
          const iframes = Array.from(document.querySelectorAll('iframe'));
          return iframes.map((f, i) => {
            let docText = '';
            let docHtml = '';
            try {
              const doc = f.contentDocument || f.contentWindow.document;
              docText = doc ? doc.body.innerText : 'cross-origin';
              docHtml = doc ? doc.body.innerHTML : 'cross-origin';
            } catch(e) {
              docText = 'error: ' + e.message;
            }
            return {
              index: i,
              id: f.id,
              src: f.src,
              textLen: docText.length,
              snippet: docText.slice(0, 300)
            };
          });
        })()
      `);

      console.log('Iframe info:', JSON.stringify(iframeInfo, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
