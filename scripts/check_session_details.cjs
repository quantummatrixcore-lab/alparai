const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkCookiesAndSession() {
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
        return {
          cookies: document.cookie,
          user: typeof aim !== 'undefined' ? aim.user : null,
          title: document.title,
          url: window.location.href
        };
      })()`
    });
    console.log('SESSION_DETAILS:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
checkCookiesAndSession();
