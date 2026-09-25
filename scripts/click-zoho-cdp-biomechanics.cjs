const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
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
      console.log('Connected to Zoho tab via CDP');

      // Get bounding boxes of all .zmLSub items
      const coordsCode = `
        (function() {
          const els = Array.from(document.querySelectorAll('.zmLSub'));
          return els.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              text: el.innerText.trim(),
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              width: rect.width,
              height: rect.height
            };
          }).filter(c => c.width > 0 && c.height > 0);
        })()
      `;

      const coords = await evalJs(coordsCode);
      console.log(`Found ${coords.length} visible email subjects with coordinates.`);

      const fullEmails = [];

      for (let i = 0; i < coords.length; i++) {
        const item = coords[i];
        console.log(`\n--- [${i + 1}/${coords.length}] Click coordinate (${Math.round(item.x)}, ${Math.round(item.y)}): ${item.text} ---`);

        // Perform real CDP mouse click
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: item.x, y: item.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: item.x, y: item.y, clickCount: 1 });

        // Wait 2.5s for detail view to load
        await new Promise(r => setTimeout(r, 2500));

        // Read page text & full detail view HTML
        const detailCode = `
          (function() {
            // Find all visible text in detail containers
            const detailContainer = document.querySelector('[role="main"]') || document.body;
            const fullText = detailContainer.innerText || '';
            const html = detailContainer.innerHTML || '';

            return {
              textSnippet: fullText.slice(0, 4000),
              htmlSnippet: html.slice(0, 10000)
            };
          })()
        `;

        const detail = await evalJs(detailCode);
        console.log(`Read snippet length: ${detail.textSnippet.length} chars`);
        if (detail.textSnippet.length > 50) {
          console.log(`Snippet preview: ${detail.textSnippet.replace(/\\s+/g, ' ').slice(0, 150)}`);
        }

        fullEmails.push({
          subject: item.text,
          detail
        });
      }

      fs.writeFileSync('d:/AlparAi/zoho_full_emails.json', JSON.stringify(fullEmails, null, 2));
      console.log(`\nSaved ${fullEmails.length} emails to d:/AlparAi/zoho_full_emails.json`);
      ws.close();
      process.exit(0);
    });
  });
});
