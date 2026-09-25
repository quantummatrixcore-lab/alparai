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
      console.log('Connected to Zoho tab CDP. Clicking an email row...');

      // Find first .zmLSub element coordinates
      const target = await evalJs(`
        (function() {
          const els = Array.from(document.querySelectorAll('.zmLSub'));
          for (let el of els) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              return {
                text: el.innerText.trim(),
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };
            }
          }
          return null;
        })()
      `);

      if (!target) {
        console.log('No visible .zmLSub found!');
        ws.close();
        process.exit(1);
      }

      console.log(`Clicking target row: ${target.text} at (${Math.round(target.x)}, ${Math.round(target.y)})`);
      await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: target.x, y: target.y, clickCount: 1 });
      await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: target.x, y: target.y, clickCount: 1 });

      await new Promise(r => setTimeout(r, 2000));

      // Check all elements in DOM after click
      const domDetails = await evalJs(`
        (function() {
          // Find element that appeared or contains the email view
          const els = Array.from(document.querySelectorAll('div, section, iframe')).map(el => {
            const cl = String(el.className || '');
            const id = String(el.id || '');
            return {
              tag: el.tagName,
              class: cl,
              id: id,
              textLen: el.innerText ? el.innerText.length : 0,
              snippet: el.innerText ? el.innerText.slice(0, 100).replace(/\\s+/g, ' ') : ''
            };
          }).filter(e => e.textLen > 20 && (e.class.includes('zm') || e.class.includes('msg') || e.id.includes('msg') || e.class.includes('Detail') || e.class.includes('Mail') || e.class.includes('Body')));

          return els;
        })()
      `);

      console.log('Matching DOM elements after single click:', JSON.stringify(domDetails, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
