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
        // Inspect jQuery event handlers or row click
        const row = document.getElementById('row46192');
        const editSpan = row ? row.querySelector('.row-grid-edit') : null;
        
        // Check jQuery data
        const jqData = (window.$ && row) ? {
          rowEvents: window.$._data(row, 'events'),
          spanEvents: editSpan ? window.$._data(editSpan, 'events') : null,
          tableEvents: window.$._data(document.querySelector('table'), 'events')
        } : null;

        // Check window functions matching 'personel' or 'duzenle' or 'edit'
        const fnNames = Object.keys(window).filter(k => /personel|duzenle|edit|kayit/i.test(k));

        return {
          hasJQuery: !!window.$,
          jqData,
          fnNames
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
      console.log('Inspection:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
