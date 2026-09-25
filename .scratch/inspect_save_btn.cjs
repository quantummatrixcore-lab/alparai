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
        // Find save buttons inside the active form or portlet
        const saveBtns = Array.from(document.querySelectorAll('.saveButton, button, input[type=\"button\"], a.btn'))
          .filter(b => /kaydet|save/i.test(b.innerText || b.value || b.className))
          .map(b => ({
            id: b.id,
            tag: b.tagName,
            class: b.className,
            text: b.innerText || b.value,
            onclick: b.getAttribute('onclick')
          }));

        return { saveBtns };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Save buttons:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
