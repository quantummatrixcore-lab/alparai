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
        // Click on "Proje Künyesi" button (id: 13)
        const btn = document.getElementById('13') || Array.from(document.querySelectorAll('a, button, span')).find(e => e.innerText && e.innerText.trim() === 'Proje Künyesi');
        if (!btn) return { error: 'Proje Künyesi button not found' };
        btn.click();
        await new Promise(r => setTimeout(r, 2000));

        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'))
          .filter(e => e.offsetParent !== null)
          .map(e => ({
            id: e.id,
            name: e.name,
            tag: e.tagName,
            type: e.type,
            val: e.value,
            selectedText: e.tagName === 'SELECT' ? e.options[e.selectedIndex]?.text : ''
          }));

        return {
          title: document.querySelector('.portlet-title, .caption, h3, h4')?.innerText.trim(),
          inputs
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
      console.log('Proje Künyesi state:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
