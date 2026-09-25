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
      const code = `
        (function() {
          const res = {};
          res.globalKeys = Object.keys(window).filter(k => k.startsWith('z') || k.startsWith('Z') || k.startsWith('m') || k.startsWith('M'));
          
          // Search for email subjects in DOM
          const allTextEls = Array.from(document.querySelectorAll('*')).filter(e => e.children.length === 0 && e.innerText && e.innerText.includes('Teknopark'));
          res.teknoparkEls = allTextEls.map(e => ({
            tag: e.tagName,
            class: e.className,
            parentClass: e.parentElement ? e.parentElement.className : '',
            text: e.innerText
          }));

          return res;
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Zoho internals:', JSON.stringify(parsed.result?.result?.value, null, 2));
        ws.close();
        process.exit(0);
      }
    });
  });
});
