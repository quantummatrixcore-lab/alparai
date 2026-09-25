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
        const cardIds = ['15', '19', '25', '27'];
        const results = {};

        for (const cid of cardIds) {
          const btn = document.getElementById(cid);
          if (!btn) { results[cid] = 'NOT_FOUND'; continue; }
          btn.click();
          await new Promise(r => setTimeout(r, 1500));

          const inputs = Array.from(document.querySelectorAll('input:not([type=\"hidden\"]), select, textarea'))
            .filter(e => e.offsetParent !== null)
            .map(e => ({
              id: e.id,
              name: e.name,
              tag: e.tagName,
              type: e.type,
              val: e.value?.slice(0, 100),
              checked: e.checked
            }));

          results[cid] = {
            title: document.querySelector('.portlet-title, .caption, h3, h4')?.innerText.trim(),
            inputs
          };
        }
        return results;
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Cards 15, 19, 25, 27:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
