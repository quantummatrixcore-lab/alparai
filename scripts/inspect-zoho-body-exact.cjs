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
      console.log('Inspecting exact email message body in Zoho tab...');

      const bodyInfo = await evalJs(`
        (function() {
          // Find all elements that look like message bodies (excluding headers/toolbars)
          const candidates = Array.from(document.querySelectorAll('div, section, article')).filter(e => {
            const cl = e.className || '';
            const id = e.id || '';
            // Exclude app headers and menu bars
            if (cl.includes('zmAppHeader') || cl.includes('zmmenubar') || cl.includes('zmAH') || cl.includes('zmListing')) {
              return false;
            }
            return (cl.includes('Body') || cl.includes('body') || cl.includes('Msg') || id.includes('Msg') || id.includes('body')) && e.innerText && e.innerText.length > 30;
          });

          return candidates.map(c => ({
            tag: c.tagName,
            class: c.className,
            id: c.id,
            textLen: c.innerText.length,
            textSnippet: c.innerText.replace(/\\s+/g, ' ').slice(0, 300)
          }));
        })()
      `);

      console.log('Exact candidate message bodies:', JSON.stringify(bodyInfo, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
