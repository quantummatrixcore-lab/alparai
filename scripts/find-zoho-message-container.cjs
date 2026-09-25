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

    function sendCmd(method, params) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 100000);
        const handler = (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            resolve(parsed.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalJs(code) {
      const res = await sendCmd('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true });
      return res?.result?.value;
    }

    ws.on('open', async () => {
      console.log('Finding Teknopark email subject row...');
      
      const pos = await evalJs(`
        (function() {
          const els = Array.from(document.querySelectorAll('.zmLSub'));
          const el = els.find(e => e.innerText.includes('Teknopark') || e.innerText.includes('TEKNOPARK'));
          if (el) {
            const rect = el.getBoundingClientRect();
            return { text: el.innerText, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
          return null;
        })()
      `);

      console.log('Target element pos:', pos);

      if (pos) {
        // Dispatch double click to open email detail view in full tab or pane!
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });
        await new Promise(r => setTimeout(r, 300));
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: pos.x, y: pos.y, clickCount: 2 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: pos.x, y: pos.y, clickCount: 2 });

        await new Promise(r => setTimeout(r, 2500));

        // Search for containers with text longer than 200 chars
        const containers = await evalJs(`
          (function() {
            const all = Array.from(document.querySelectorAll('div, section, article, p, td'));
            return all.filter(e => {
              const text = e.innerText || '';
              return text.length > 200 && text.includes('Kuluçka') || text.includes('Teknopark') || text.includes('başvuru') || text.includes('BAŞVURU');
            }).map(e => ({
              tag: e.tagName,
              class: e.className,
              id: e.id,
              len: e.innerText.length,
              snippet: e.innerText.replace(/\\s+/g, ' ').slice(0, 300),
              htmlSnippet: e.innerHTML.slice(0, 500)
            }));
          })()
        `);

        console.log('Found Teknopark content containers:', JSON.stringify(containers, null, 2));
      }

      ws.close();
      process.exit(0);
    });
  });
});
