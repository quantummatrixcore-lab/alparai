const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!target) {
      console.log('Target tab not found! Tabs:', list);
      return;
    }
    console.log('Found target:', target.id, target.url);
    
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      console.log('Connected to CDP');
      const expr = `(() => {
        const url = window.location.href;
        const title = document.title;
        const menuLinks = Array.from(document.querySelectorAll('a, .nav-link, button'))
          .map(e => ({ text: e.innerText.trim(), href: e.href || '', id: e.id, class: e.className }))
          .filter(e => e.text.length > 0 && e.text.length < 50);
        return { url, title, menuLinks: menuLinks.slice(0, 40) };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: expr,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('CDP Resp Result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
    ws.onerror = (err) => console.error('WS Error:', err);
  });
});
