const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!target) return console.error('Target tab not found');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(() => {
        // Find all dialog close buttons or window close icons
        const closeSelectors = [
          '.ui-dialog-titlebar-close',
          '.closeButton',
          'a.ui-dialog-titlebar-close',
          '.ui-icon-closethick',
          '.window-close',
          '.portlet-title a.remove',
          'span.ui-icon-closethick'
        ];

        let closed = 0;
        // Search all elements matching x in titlebar
        const allElements = Array.from(document.querySelectorAll('*'));
        const closeBtns = allElements.filter(el => {
          const text = el.innerText?.trim();
          const title = el.getAttribute('title');
          const className = el.className || '';
          if (typeof className !== 'string') return false;
          
          if (className.includes('ui-dialog-titlebar-close') || className.includes('closeButton')) return true;
          if (title && /kapat|close/i.test(title)) return true;
          if (text === '×' || text === 'X' || text === 'x') {
            // Check if inside a titlebar or dialog
            if (el.closest('.ui-dialog-titlebar, .portlet-title, .modal-header, .panel-heading')) return true;
          }
          return false;
        });

        for (let btn of closeBtns) {
          try {
            btn.click();
            closed++;
          } catch(e) {}
        }

        // Also check for jquery ui dialog close
        if (window.$ && window.$.fn && window.$.fn.dialog) {
          window.$('.ui-dialog-content').each(function() {
            try { window.$(this).dialog('close'); closed++; } catch(e) {}
          });
        }

        return {
          foundButtons: closeBtns.length,
          closed
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
      console.log('CLOSE RESULT:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
