const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(async () => {
        // 1. Click Proje Künyesi (13)
        const btn = document.getElementById('13');
        if (!btn) return { error: 'Btn 13 not found' };
        btn.click();
        await new Promise(r => setTimeout(r, 1500));

        // Find the opened dialog
        const dialog = Array.from(document.querySelectorAll('.ui-dialog'))
          .find(d => d.offsetParent !== null && d.style.display !== 'none');

        if (!dialog) return { error: 'Dialog did not open' };

        const title = dialog.querySelector('.ui-dialog-title')?.innerText.trim();
        const saveBtn = Array.from(dialog.querySelectorAll('a, button, span')).find(b => /kaydet/i.test(b.innerText || ''));
        
        // Find close button in titlebar
        const closeBtn = dialog.querySelector('.ui-dialog-titlebar a.ui-dialog-titlebar-close, .ui-dialog-titlebar .ui-icon-closethick')?.closest('a')
          || Array.from(dialog.querySelectorAll('.ui-dialog-titlebar a')).pop();

        // 2. Click close button
        if (closeBtn) {
          closeBtn.click();
        } else if (window.$) {
          window.$(dialog).find('.ui-dialog-content').dialog('close');
        }
        await new Promise(r => setTimeout(r, 1000));

        const stillOpen = Array.from(document.querySelectorAll('.ui-dialog'))
          .filter(d => d.offsetParent !== null && d.style.display !== 'none');

        return {
          openedTitle: title,
          hasSaveBtn: !!saveBtn,
          hasCloseBtn: !!closeBtn,
          stillOpenCount: stillOpen.length
        };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Single card flow test:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
