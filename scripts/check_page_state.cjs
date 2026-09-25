const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkTabLogsAndErrors() {
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
          url: window.location.href,
          title: document.title,
          bodySnippet: document.body.innerText.slice(0, 800)
        };
      })()`
    });
    console.log('PAGE_INFO:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
checkTabLogsAndErrors();
