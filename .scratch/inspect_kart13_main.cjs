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
        const inputs = Array.from(document.querySelectorAll('input:not([type=\"checkbox\"]):not([type=\"hidden\"]), select, textarea'))
          .filter(e => e.offsetParent !== null)
          .map(e => ({
            id: e.id,
            name: e.name,
            val: e.value,
            text: e.tagName === 'SELECT' ? e.options[e.selectedIndex]?.text : ''
          }));
        return { inputs };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Kart 13 main inputs:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
