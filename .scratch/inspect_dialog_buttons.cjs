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
        // Find visible dialogs
        const visibleDialogs = Array.from(document.querySelectorAll('.ui-dialog'))
          .filter(d => d.offsetParent !== null && d.style.display !== 'none');

        const details = visibleDialogs.map(d => {
          const title = d.querySelector('.ui-dialog-title')?.innerText.trim();
          const saveBtn = Array.from(d.querySelectorAll('a, button, span')).find(b => /kaydet/i.test(b.innerText || ''));
          const closeBtn = d.querySelector('.ui-dialog-titlebar-close, .close, a.ui-corner-all:has(.ui-icon-closethick)');
          const allTitlebarLinks = Array.from(d.querySelectorAll('.ui-dialog-titlebar a')).map(a => ({
            class: a.className,
            text: a.innerText,
            html: a.outerHTML
          }));

          return {
            title,
            saveBtn: saveBtn ? { tag: saveBtn.tagName, class: saveBtn.className, text: saveBtn.innerText, html: saveBtn.outerHTML } : null,
            closeBtn: closeBtn ? { tag: closeBtn.tagName, class: closeBtn.className, html: closeBtn.outerHTML } : null,
            allTitlebarLinks
          };
        });

        return { visibleCount: visibleDialogs.length, details };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('ACTIVE DIALOG DETAILS:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
