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
        const dialog = document.querySelector('.ui-dialog:not([style*=\"display: none\"])');
        if (!dialog) return 'no open dialog';
        const closeAnchor = dialog.querySelector('.fa-times')?.closest('a');
        if (!closeAnchor) return 'no close anchor';

        closeAnchor.click();
        $(closeAnchor).trigger('click');

        const stillVisible = document.querySelectorAll('.ui-dialog:not([style*=\"display: none\"])').length;
        return {
          clicked: true,
          stillVisible
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
      console.log('Close by fa-times result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
