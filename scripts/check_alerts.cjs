const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkPageAlerts() {
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
        const alerts = Array.from(document.querySelectorAll('.alert, .sweet-alert, .swal2-container, .modal.in')).map(a => a.innerText);
        return {
          alerts,
          bodyTextFirst500: document.body.innerText.slice(0, 500)
        };
      })()`
    });
    console.log('ALERTS_CHECK:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
checkPageAlerts();
