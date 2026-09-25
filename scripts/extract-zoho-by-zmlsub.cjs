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
      console.log('Connected to Zoho tab CDP');

      const subjectsScript = `
        (function() {
          const subEls = Array.from(document.querySelectorAll('.zmLSub, .zmLForm, [class*="zmLSub"]'));
          return subEls.map((el, index) => {
            el.setAttribute('data-subject-index', index);
            return {
              index,
              text: el.innerText.trim()
            };
          });
        })()
      `;

      const subjects = await evalJs(subjectsScript);
      console.log('Found subjects count:', subjects.length);
      console.log(subjects);

      const extractedEmails = [];

      for (let i = 0; i < subjects.length; i++) {
        console.log(`Extracting [${i + 1}/${subjects.length}]: ${subjects[i].text}`);

        // Click subject element
        await evalJs(`
          (function() {
            const el = document.querySelector('[data-subject-index="${i}"]');
            if (el) {
              const clickTarget = el.closest('tr, li, div[class*="Row"], div[class*="row"]') || el;
              clickTarget.click();
            }
          })()
        `);

        // Wait 1.5s
        await new Promise(r => setTimeout(r, 1500));

        // Read detail pane
        const detail = await evalJs(`
          (function() {
            // Find detail view container
            const allContainers = Array.from(document.querySelectorAll('div, section, article')).filter(e => {
              const cl = e.className || '';
              return (cl.includes('zmDet') || cl.includes('zmMsg') || cl.includes('zmMailDet') || cl.includes('Detail')) && e.offsetHeight > 200;
            });

            const bodyEl = document.querySelector('[class*="zmMsgBody"], [class*="mailBody"], [class*="MailBody"], iframe') || document.body;

            return {
              subjectText: document.querySelector('[class*="Subject"]')?.innerText || '',
              fromText: document.querySelector('[class*="Sender"]')?.innerText || document.querySelector('[class*="from"]')?.innerText || '',
              dateText: document.querySelector('[class*="Date"]')?.innerText || '',
              textSnippet: bodyEl.innerText ? bodyEl.innerText.slice(0, 3000) : '',
              htmlSnippet: bodyEl.innerHTML ? bodyEl.innerHTML.slice(0, 8000) : ''
            };
          })()
        `);

        extractedEmails.push({
          subject: subjects[i].text,
          detail
        });
      }

      fs.writeFileSync('d:/AlparAi/zoho_extracted_emails.json', JSON.stringify(extractedEmails, null, 2));
      console.log(`Saved ${extractedEmails.length} emails to d:/AlparAi/zoho_extracted_emails.json`);
      ws.close();
      process.exit(0);
    });
  });
});
