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
        // Trigger jQuery click on the edit span
        window.$('#row46192 .row-grid-edit').trigger('click');
        await new Promise(r => setTimeout(r, 2000));

        // Check visible inputs or modal
        const visibleInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'))
          .filter(el => el.offsetParent !== null)
          .map(el => ({
            id: el.id,
            name: el.name,
            tag: el.tagName,
            type: el.type,
            val: el.value,
            selectedText: el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.text : ''
          }));

        // Check if there is an active modal or tab
        const modal = document.querySelector('.modal.in, .bootbox.in, .ui-dialog:not([style*="display: none"])');

        return {
          modal: modal ? modal.className : null,
          inputCount: visibleInputs.length,
          inputs: visibleInputs
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
      console.log('Result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
