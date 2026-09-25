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
      console.log('Connected to Zoho tab CDP');

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
      console.log(`Found ${coords.length} email subject rows with coordinates.`);

      const fullEmails = [];

      for (let i = 0; i < coords.length; i++) {
        const item = coords[i];
        console.log(`\n--- [${i + 1}/${coords.length}] Clicking (${Math.round(item.x)}, ${Math.round(item.y)}): ${item.text} ---`);

        // Click row twice to open detail view
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: item.x, y: item.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: item.x, y: item.y, clickCount: 1 });
        await new Promise(r => setTimeout(r, 200));
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: item.x, y: item.y, clickCount: 2 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: item.x, y: item.y, clickCount: 2 });

        // Wait 2s for detail pane to load
        await new Promise(r => setTimeout(r, 2000));

        // Read detail container HTML
        const detailCode = `
          (function() {
            // Find container that holds the message body
            const selectors = [
              '[zmattwrappercomp="true"]',
              '.jsDetailView',
              '#msgView',
              '.zmMsgView',
              '[role="main"]',
              '.zmContent'
            ];

            let container = null;
            for (let s of selectors) {
              const el = document.querySelector(s);
              if (el && el.innerText && el.innerText.length > 50) {
                container = el;
                break;
              }
            }

            if (!container) container = document.body;

            return {
              textSnippet: container.innerText ? container.innerText.slice(0, 5000) : '',
              htmlSnippet: container.innerHTML ? container.innerHTML.slice(0, 15000) : ''
            };
          })()
        `;

        const detail = await evalJs(detailCode);
        console.log(`Extracted text length: ${detail.textSnippet.length}, HTML length: ${detail.htmlSnippet.length}`);
        if (detail.textSnippet.length > 50) {
          console.log(`Snippet: ${detail.textSnippet.replace(/\\s+/g, ' ').slice(0, 150)}`);
        }

        fullEmails.push({
          subject: item.text,
          detail
        });
      }

      fs.writeFileSync('d:/AlparAi/zoho_full_html_emails.json', JSON.stringify(fullEmails, null, 2));
      console.log(`\nSaved ${fullEmails.length} full HTML emails to d:/AlparAi/zoho_full_html_emails.json`);
      ws.close();
      process.exit(0);
    });
  });
});
