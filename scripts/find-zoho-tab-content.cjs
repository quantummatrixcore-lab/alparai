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
      console.log('Inspecting open tab containers in Zoho Mail...');

      const tabContainers = await evalJs(`
        (function() {
          const tabs = Array.from(document.querySelectorAll('[id*="jstab-"], .SCm'));
          return tabs.map(t => {
            // Remove toolbar buttons from copy
            const clone = t.cloneNode(true);
            const headers = clone.querySelectorAll('.zmAppHeader, .zmmenubar, .zmAHRow');
            headers.forEach(h => h.remove());

            return {
              id: t.id,
              textLen: clone.innerText ? clone.innerText.length : 0,
              textSnippet: clone.innerText ? clone.innerText.replace(/\\s+/g, ' ').slice(0, 500) : '',
              htmlSnippet: clone.innerHTML ? clone.innerHTML.slice(0, 2000) : ''
            };
          });
        })()
      `);

      console.log('Open tab containers:', JSON.stringify(tabContainers, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
