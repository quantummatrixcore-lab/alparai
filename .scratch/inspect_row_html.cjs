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
        const row = Array.from(document.querySelectorAll('tr')).find(r => r.innerText && r.innerText.includes('ERCÜMENT ERDEN'));
        if (!row) return { error: 'Row not found' };
        return {
          rowHtml: row.outerHTML,
          buttons: Array.from(row.querySelectorAll('a, button, i, span')).map(e => ({
            tag: e.tagName,
            class: e.className,
            onclick: e.getAttribute('onclick'),
            href: e.getAttribute('href'),
            text: e.innerText
          }))
        };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Row HTML & buttons:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
