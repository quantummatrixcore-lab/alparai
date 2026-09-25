const WebSocket = require('d:/AlparAi/node_modules/ws');

async function inspectTab46() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return console.log('No arge tab');
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) resolve(parsed.result);
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.on('open', async () => {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('46');
        if (!btn) return 'Button 46 not found';
        return JSON.stringify({
          id: btn.id,
          tag: btn.tagName,
          onclick: btn.getAttribute('onclick'),
          href: btn.getAttribute('href'),
          html: btn.outerHTML
        });
      })()`
    });
    console.log('BTN_46_INFO:', res.result.value);
    ws.close();
  });
}
inspectTab46();
