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
      console.log('Clicking Teknopark email row...');
      
      const pos = await evalJs(`
        (function() {
          const els = Array.from(document.querySelectorAll('.zmLSub'));
          const el = els.find(e => e.innerText.includes('Teknopark') || e.innerText.includes('Firma Başvuru'));
          if (el) {
            const rect = el.getBoundingClientRect();
            return { text: el.innerText, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
          return null;
        })()
      `);

      if (pos) {
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: pos.x, y: pos.y, clickCount: 1 });
        await new Promise(r => setTimeout(r, 200));
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: pos.x, y: pos.y, clickCount: 2 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: pos.x, y: pos.y, clickCount: 2 });

        await new Promise(r => setTimeout(r, 2500));

        // Find elements containing email body text
        const exactBodies = await evalJs(`
          (function() {
            const els = Array.from(document.querySelectorAll('*')).filter(e => {
              const t = e.innerText || '';
              // Body should contain email body text, NOT toolbar text ("Gelen Kutusu", "Görünümler")
              return (t.includes('Sayın') || t.includes('Sayin') || t.includes('Merhaba') || t.includes('Başvuru') || t.includes('Kuluçka') || t.includes('bilginize')) && !t.includes('Görünümler') && !t.includes('Şuraya taşı') && e.children.length < 5;
            });

            return els.map(e => ({
              tag: e.tagName,
              class: e.className,
              id: e.id,
              parentClass: e.parentElement ? e.parentElement.className : '',
              text: e.innerText.replace(/\\s+/g, ' ').slice(0, 400),
              html: e.innerHTML.slice(0, 1000)
            }));
          })()
        `);

        console.log('Exact body elements found:', JSON.stringify(exactBodies, null, 2));
      }

      ws.close();
      process.exit(0);
    });
  });
});
