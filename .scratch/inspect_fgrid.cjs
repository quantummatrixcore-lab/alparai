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
        const table = document.querySelector('.bDiv table');
        const fgrid = window.$ && table ? window.$(table).closest('.flexigrid')[0] : null;
        const gridObj = window.$ && table ? window.$(table).data('flexigrid') || window.$(table).closest('.flexigrid').data('flexigrid') : null;
        
        // Find click handlers inside .bDiv
        const bDiv = document.querySelector('.bDiv');
        const bDivEvents = window.$ && bDiv ? window.$._data(bDiv, 'events') : null;
        const trEvents = window.$ && document.querySelector('#row46192') ? window.$._data(document.querySelector('#row46192'), 'events') : null;
        
        // Also let's check what happens if we trigger mousedown, click, etc on .row-grid-edit
        const editSpan = document.querySelector('#row46192 .row-grid-edit');
        const spanEvents = window.$ && editSpan ? window.$._data(editSpan, 'events') : null;

        return {
          hasFgrid: !!fgrid,
          bDivEvents: bDivEvents ? Object.keys(bDivEvents) : null,
          trEvents: trEvents ? Object.keys(trEvents) : null,
          spanEvents: spanEvents ? Object.keys(spanEvents) : null
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
      console.log('Flexigrid details:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
