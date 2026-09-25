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
        // Find all elements with class ui-dialog and close/hide them
        const dialogs = document.querySelectorAll('.ui-dialog');
        dialogs.forEach(d => {
          const closeBtn = d.querySelector('.ui-dialog-titlebar-close, .closeButton, a.ui-corner-all');
          if (closeBtn) closeBtn.click();
          else d.style.display = 'none';
        });

        // If jquery dialog exists
        if (window.$) {
          window.$('.ui-dialog-content').each(function() {
            try { window.$(this).dialog('close'); } catch(e) {}
          });
        }

        // Return remaining visible count
        const remaining = Array.from(document.querySelectorAll('.ui-dialog'))
          .filter(d => d.offsetParent !== null && d.style.display !== 'none');

        return { remainingCount: remaining.length };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Close remaining result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
