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
        // Search jQuery events on document or body for delegation
        const bodyEvents = window.$ ? window.$._data(document.body, 'events') : null;
        const docEvents = window.$ ? window.$._data(document, 'events') : null;
        
        let delegation = [];
        if (docEvents && docEvents.click) {
          delegation = docEvents.click.map(h => ({ selector: h.selector, handler: h.handler.toString().slice(0, 150) }));
        }
        
        // Also check Portlet/card buttons
        const adayfirmabuttons = Array.from(document.querySelectorAll('.adayfirmabutton')).map(b => ({ id: b.id, text: b.innerText }));

        return { delegation, adayfirmabuttons };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
