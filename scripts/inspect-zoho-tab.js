const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const zohoTab = tabs.find(t => t.url && t.url.includes('zoho.eu'));
    if (!zohoTab) {
      console.log('Zoho tab not found!');
      process.exit(1);
    }
    console.log('Found Zoho tab:', zohoTab.title);
    const ws = new WebSocket(zohoTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      const code = `
        (function() {
          const rows = Array.from(document.querySelectorAll('.zmListRow, [data-msgid], tr, div')).filter(e => e.innerText && e.innerText.includes('teknoparkistanbul'));
          return rows.map(r => ({
            text: r.innerText.replace(/\\s+/g, ' ').slice(0, 200),
            id: r.getAttribute('data-msgid') || r.id || r.getAttribute('data-zm-id')
          }));
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Zoho Teknopark messages found:', JSON.stringify(parsed.result?.result?.value, null, 2));
        ws.close();
      }
    });
  });
});
