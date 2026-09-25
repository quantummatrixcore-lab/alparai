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
    ws.on('open', () => {
      // Execute script in Zoho tab to extract messages or click through them
      const code = `
        (async function() {
          // Let's find all email items in the list view
          const msgEls = Array.from(document.querySelectorAll('.zmListRow, [data-msgid], tr.zmListRow'));
          const messagesInfo = [];

          // Let's get list text for all rows
          const rows = Array.from(document.querySelectorAll('div, tr, li')).filter(e => {
            const t = e.innerText || '';
            return (t.includes('Teknopark') || t.includes('teknoparkistanbul') || t.includes('Zoho') || t.includes('leaderboard') || t.includes('Kuluçka')) && e.childElementCount < 5 && t.length < 300;
          });

          return {
            msgCount: msgEls.length,
            rowsCount: rows.length,
            sampleRows: rows.slice(0, 15).map(r => r.innerText.replace(/\\s+/g, ' '))
          };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
    });

    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Zoho inbox scan result:', JSON.stringify(parsed.result?.result?.value, null, 2));
        ws.close();
        process.exit(0);
      }
    });
  });
});
