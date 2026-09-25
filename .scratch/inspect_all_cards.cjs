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
        const cardIds = ['15', '19', '25', '26', '27', '30', '33', '37', '38', '39', '40', '41'];
        const summary = {};

        for (const cid of cardIds) {
          const btn = document.getElementById(cid);
          if (!btn) { summary[cid] = 'BTN_NOT_FOUND'; continue; }
          btn.click();
          await new Promise(r => setTimeout(r, 1200));

          const textareas = Array.from(document.querySelectorAll('textarea'))
            .filter(t => t.offsetParent !== null)
            .map(t => ({ id: t.id, name: t.name, valLen: t.value.length, snippet: t.value.slice(0, 80) }));

          const textInputs = Array.from(document.querySelectorAll('input[type=\"text\"]'))
            .filter(i => i.offsetParent !== null && !['search-fld', ''].includes(i.id))
            .map(i => ({ id: i.id, name: i.name, val: i.value }));

          summary[cid] = {
            cardId: cid,
            title: document.querySelector('.portlet-title, .caption, h3, h4')?.innerText.trim(),
            textareas,
            textInputs
          };
        }
        return summary;
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('ALL CARDS MAP:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
