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
        const visibleDialogs = Array.from(document.querySelectorAll('.ui-dialog:not([style*=\"display: none\"]), .window:not([style*=\"display: none\"]), .panel:not([style*=\"display: none\"])'))
          .filter(d => d.offsetParent !== null && d.offsetWidth > 100)
          .map(d => ({
            title: d.querySelector('.ui-dialog-title, .title, h3, h4')?.innerText.trim(),
            style: d.getAttribute('style')
          }));

        // Find any remaining x or close buttons
        const remainingClose = Array.from(document.querySelectorAll('.ui-dialog-titlebar-close, .closeButton'))
          .filter(b => b.offsetParent !== null)
          .map(b => b.className);

        return {
          visibleDialogCount: visibleDialogs.length,
          visibleDialogs,
          remainingCloseCount: remainingClose.length
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
      console.log('REMAINING DIALOGS:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
