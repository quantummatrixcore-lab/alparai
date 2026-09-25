const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(() => {
        // Find all rows in all tables or flexigrid
        const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText.trim().replace(/\\s+/g, ' ')).filter(Boolean);
        const buttons = Array.from(document.querySelectorAll('.btn, a.btn, input[type=\"button\"], button')).map(b => ({ text: b.innerText.trim(), id: b.id, class: b.className }));
        return { rows: rows.slice(0, 20), buttons };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('DOM Details:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
