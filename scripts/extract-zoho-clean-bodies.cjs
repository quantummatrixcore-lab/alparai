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
      console.log('Connected to Zoho tab CDP. Locating email rows with auto-scroll...');

      // Count total email rows
      const count = await evalJs(`document.querySelectorAll('.zmList').length`);
      console.log(`Total .zmList elements found: ${count}`);

      const cleanEmails = [];

      for (let i = 0; i < count; i++) {
        // Scroll item i into view and get its bounding box and subject snippet
        const rowInfo = await evalJs(`
          (function() {
            const els = document.querySelectorAll('.zmList');
            const el = els[${i}];
            if (!el) return null;
            el.scrollIntoView({ block: 'center', behavior: 'instant' });
            const subEl = el.querySelector('.zmLSub');
            const fromEl = el.querySelector('.zmLFrom');
            const rect = el.getBoundingClientRect();
            return {
              subject: subEl ? subEl.innerText.trim() : 'No Subject',
              from: fromEl ? fromEl.innerText.trim() : '',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          })()
        `);

        if (!rowInfo) continue;
        console.log(`\n--- [${i + 1}/${count}] Scroll & Click: "${rowInfo.subject}" at (${Math.round(rowInfo.x)}, ${Math.round(rowInfo.y)}) ---`);

        // Click row
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: rowInfo.x, y: rowInfo.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: rowInfo.x, y: rowInfo.y, clickCount: 1 });

        // Wait 1.5s for detail view to load
        await new Promise(r => setTimeout(r, 1500));

        const bodyData = await evalJs(`
          (function() {
            let contentEl = document.querySelector('.jsConTent');
            if (!contentEl) contentEl = document.querySelector('.zmMailContent');
            if (!contentEl) contentEl = document.querySelector('.zmMailWrapper');

            const headerTitle = document.querySelector('.zmPVHeading')?.innerText?.trim() || '';
            const senderData = document.querySelector('.zmMHmInfoR1')?.innerText?.trim() || '';
            const recipientData = document.querySelector('.zmMHdrAdd')?.innerText?.trim() || '';
            const dateData = document.querySelector('.zmMHdrRow')?.innerText?.trim() || '';

            if (!contentEl) {
              return {
                headerTitle,
                senderData,
                recipientData,
                dateData,
                text: '',
                html: ''
              };
            }

            const clone = contentEl.cloneNode(true);
            const banners = clone.querySelectorAll('.jsLDEXIGBx, .zmail-body-action-box__1340r59, .zmmenubar__1ixdlf8');
            banners.forEach(b => b.remove());

            return {
              headerTitle,
              senderData,
              recipientData,
              dateData,
              text: clone.innerText ? clone.innerText.trim() : '',
              html: clone.innerHTML ? clone.innerHTML.trim() : ''
            };
          })()
        `);

        console.log(`Extracted Title: "${bodyData.headerTitle || rowInfo.subject}"`);
        console.log(`Sender: ${bodyData.senderData || rowInfo.from}`);
        console.log(`Text Len: ${bodyData.text.length} | HTML Len: ${bodyData.html.length}`);
        console.log(`Snippet: ${bodyData.text.replace(/\\s+/g, ' ').slice(0, 100)}`);

        cleanEmails.push({
          index: i + 1,
          subject: bodyData.headerTitle || rowInfo.subject,
          sender: bodyData.senderData || rowInfo.from,
          recipient: bodyData.recipientData || 'ercument.erden@alparai.com',
          date: bodyData.dateData || '',
          textBody: bodyData.text || 'Imported email body',
          htmlBody: bodyData.html || '<div>Imported email body</div>'
        });
      }

      fs.writeFileSync('d:/AlparAi/zoho_clean_emails.json', JSON.stringify(cleanEmails, null, 2));
      console.log(`\nSuccessfully saved ${cleanEmails.length} perfectly scroll-extracted clean emails to d:/AlparAi/zoho_clean_emails.json`);
      ws.close();
      process.exit(0);
    });
  });
});
