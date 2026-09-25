const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!target) return console.log('Target tab not found');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      // Click on "Personel Ekle"
      const expr = `(async () => {
        const link = Array.from(document.querySelectorAll('a, button, span')).find(e => e.innerText && e.innerText.trim() === 'Personel Ekle');
        if (!link) return { error: 'Personel Ekle not found' };
        link.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // Find visible inputs, selects, textareas or tables
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'))
          .filter(e => e.offsetParent !== null)
          .map(e => ({
            tag: e.tagName,
            id: e.id,
            name: e.name,
            type: e.type,
            value: e.value,
            text: e.tagName === 'SELECT' ? e.options[e.selectedIndex]?.text : ''
          }));
        
        const tables = Array.from(document.querySelectorAll('table')).map(t => ({
          id: t.id,
          headers: Array.from(t.querySelectorAll('th')).map(th => th.innerText.trim()),
          rows: Array.from(t.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()))
        }));

        const cardTitle = document.querySelector('.portlet-title, .caption, h3, h4')?.innerText.trim();

        return { cardTitle, inputs: inputs.slice(0, 30), tables };
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
