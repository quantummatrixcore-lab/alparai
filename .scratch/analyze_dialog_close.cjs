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
        
        // Check jQuery dialog instance
        const content = dialog.querySelector('.ui-dialog-content');
        let dialogObj = null;
        if (content && window.$) {
          try {
            window.$(content).dialog('close');
            return { method: 'dialog(close) on content', closed: dialog.style.display === 'none' };
          } catch(e) {
            dialogObj = e.message;
          }
        }

        // Check if there is an id on content or dialog
        const id = dialog.id;
        const contentId = content ? content.id : null;

        // Check if there is a window close function in window
        const winFns = Object.keys(window).filter(k => /close|kapat|destroy|remove/i.test(k));

        return { id, contentId, dialogObj, winFns: winFns.slice(0, 20) };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Dialog close analysis:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
