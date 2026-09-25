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
      console.log('Clicking email row in list...');

      // Get click position for "Teknopark" email
      const pos = await evalJs(`
        (function() {
          const rows = Array.from(document.querySelectorAll('.zmList'));
          const r = rows.find(el => el.innerText.includes('Teknopark') || el.innerText.includes('Firma Başvuru'));
          if (r) {
            const rect = r.getBoundingClientRect();
            return { text: r.innerText.replace(/\\s+/g, ' '), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
          return null;
        })()
      `);

      console.log('Target row position:', pos);

      if (pos) {
        // Dispatch single click
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });

        await new Promise(r => setTimeout(r, 2500));

        // Scan ALL elements in the entire page for message text
        const details = await evalJs(`
          (function() {
            const all = Array.from(document.querySelectorAll('*'));
            const textContainers = all.filter(e => {
              const cl = e.className || '';
              const id = e.id || '';
              // Exclude toolbar/list headers
              if (cl.includes('zmAppHeader') || cl.includes('zmmenubar') || cl.includes('zmList') || cl.includes('SC_mclst')) {
                return false;
              }
              const t = e.innerText || '';
              return t.length > 50 && (t.includes('Teknopark') || t.includes('Kuluçka') || t.includes('Başvuru') || t.includes('Sayın')) && e.children.length < 10;
            });

            return textContainers.map(e => ({
              tag: e.tagName,
              class: e.className,
              id: e.id,
              textLen: e.innerText.length,
              textSnippet: e.innerText.replace(/\\s+/g, ' ').slice(0, 300),
              htmlSnippet: e.innerHTML.slice(0, 500)
            }));
          })()
        `);

        console.log('Detected message body containers:', JSON.stringify(details, null, 2));
      }

      ws.close();
      process.exit(0);
    });
  });
});
