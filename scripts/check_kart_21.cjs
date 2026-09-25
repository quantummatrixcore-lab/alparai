const WebSocket = require('d:/AlparAi/node_modules/ws');

async function inspectKart21() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return;
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
      returnByValue: true,
      expression: `(() => {
        // Find button 21 and check its attributes or text
        const btn21 = document.getElementById('21');
        return {
          id: btn21 ? btn21.id : null,
          text: btn21 ? btn21.innerText.trim() : null,
          isCheck: btn21 ? btn21.innerHTML.includes('fa-check') : false,
          html: btn21 ? btn21.outerHTML : null
        };
      })()`
    });
    console.log('KART_21_INFO:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
inspectKart21();
