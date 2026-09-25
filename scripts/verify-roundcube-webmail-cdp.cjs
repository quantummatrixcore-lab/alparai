const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const rcTab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!rcTab) {
      console.log('Purelymail Roundcube tab not found in Chrome');
      process.exit(1);
    }
    const ws = new WebSocket(rcTab.webSocketDebuggerUrl);

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
      console.log('Connected to Roundcube tab CDP. Reloading inbox...');

      await evalJs(`window.location.href = "https://inbox.purelymail.com/?_task=mail&_mbox=INBOX"`);
      await new Promise(r => setTimeout(r, 3000));

      const rows = await evalJs(`
        (function() {
          const list = Array.from(document.querySelectorAll('#messagelist tbody tr, table.messagelist tr'));
          return list.map((r, i) => {
            const subjectEl = r.querySelector('.subject, td.subject a, td.subject');
            const fromEl = r.querySelector('.from, td.from');
            const rect = r.getBoundingClientRect();
            return {
              index: i,
              id: r.id,
              subject: subjectEl ? subjectEl.innerText.trim() : r.innerText.trim(),
              from: fromEl ? fromEl.innerText.trim() : '',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          }).filter(r => r.x > 0 && r.y > 0);
        })()
      `);

      console.log(`Found ${rows.length} messages in Roundcube webmail:`);
      console.log(JSON.stringify(rows.map(r => r.subject), null, 2));

      // Click on item 2 (Firma Başvuru Ön Dokuman Hk.)
      const target = rows.find(r => r.subject.includes('Firma Başvuru') || r.subject.includes('Teknopark')) || rows[0];
      if (target) {
        console.log(`\nClicking email: "${target.subject}" at (${Math.round(target.x)}, ${Math.round(target.y)})...`);
        await sendCmd('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', x: target.x, y: target.y, clickCount: 1 });
        await sendCmd('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', x: target.x, y: target.y, clickCount: 1 });

        await new Promise(r => setTimeout(r, 2000));

        // Read message body iframe in Roundcube
        const messageBody = await evalJs(`
          (function() {
            const iframe = document.querySelector('iframe#messagecontframe, iframe[name="messagecontframe"]');
            if (iframe) {
              try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                return {
                  hasIframe: true,
                  text: doc.body.innerText.trim().slice(0, 500),
                  htmlLen: doc.body.innerHTML.length
                };
              } catch(e) {
                return { hasIframe: true, error: e.message };
              }
            }
            return { hasIframe: false, bodySnippet: document.body.innerText.slice(0, 300) };
          })()
        `);

        console.log('\n--- Roundcube Rendered Message Body Preview ---');
        console.log(JSON.stringify(messageBody, null, 2));
      }

      ws.close();
      process.exit(0);
    });
  });
});
