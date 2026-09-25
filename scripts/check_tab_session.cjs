const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkTabUrlAndUser() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return console.log('No tab');
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
        return JSON.stringify({
          url: window.location.href,
          title: document.title,
          user: typeof aim !== 'undefined' ? aim.user : 'NO_AIM',
          userKeyCheck: typeof helper_checkBrowserUserKey === 'function' ? helper_checkBrowserUserKey() : 'NO_FN'
        });
      })()`
    });
    console.log('TAB_STATUS:', res.result.value);
    ws.close();
  });
}
checkTabUrlAndUser();
