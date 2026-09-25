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

      // Get all clickable rows
      const listScript = `
        (function() {
          const clickableEls = Array.from(document.querySelectorAll('div, tr, span, p')).filter(e => {
            const t = e.innerText || '';
            return (t.includes('teknopark') || t.includes('TEKNOPARK') || t.includes('Teknopark') || t.includes('leaderboard') || t.includes('Deneme Süresi')) && e.offsetWidth > 100 && e.offsetHeight > 15 && e.childElementCount <= 3;
          });
          return clickableEls.map((el, i) => {
            el.setAttribute('data-target-index', i);
            return { index: i, text: el.innerText.replace(/\\s+/g, ' ') };
          });
        })()
      `;

      const rows = await evalJs(listScript);
      console.log('Found rows:', rows.length);

      const extractedEmails = [];

      for (let i = 0; i < Math.min(rows.length, 12); i++) {
        console.log(`Clicking email ${i + 1}/${rows.length}: ${rows[i].text.slice(0, 60)}`);
        
        // Click row
        await evalJs(`
          (function() {
            const el = document.querySelector('[data-target-index="${i}"]');
            if (el) el.click();
          })()
        `);

        // Wait 1.5s for detail view to load
        await new Promise(r => setTimeout(r, 1500));

        // Extract detail view content
        const detail = await evalJs(`
          (function() {
            const detailContainer = document.querySelector('.zmMsgView, #msgView, [id*="msgView"], .jsDetailView, [role="main"]') || document.body;
            const subjectEl = document.querySelector('.zmMsgSubject, .jsSubject, h2, h3, .subject');
            const fromEl = document.querySelector('.zmSenderName, .zmSenderEmail, .sender, .from');
            const dateEl = document.querySelector('.zmMsgDate, .date, .time');
            const bodyEl = document.querySelector('.zmMsgBody, .msgBody, iframe, .mailContent') || detailContainer;

            return {
              subject: subjectEl ? subjectEl.innerText.trim() : '',
              from: fromEl ? fromEl.innerText.trim() : '',
              date: dateEl ? dateEl.innerText.trim() : '',
              textSnippet: bodyEl ? bodyEl.innerText.slice(0, 1500) : '',
              fullHtml: bodyEl ? bodyEl.innerHTML.slice(0, 5000) : ''
            };
          })()
        `);

        if (detail && (detail.subject || detail.textSnippet)) {
          extractedEmails.push({
            rowSummary: rows[i].text,
            detail
          });
        }
      }

      console.log('=== EXTRACTED EMAILS TOTAL ===', extractedEmails.length);
      fs.writeFileSync('d:/AlparAi/zoho_extracted_emails.json', JSON.stringify(extractedEmails, null, 2));
      console.log('Saved to d:/AlparAi/zoho_extracted_emails.json');
      ws.close();
      process.exit(0);
    });
  });
});
