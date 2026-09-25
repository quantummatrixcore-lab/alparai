const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkFileInputs() {
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
      returnByValue: true,
      expression: `(() => {
        const fileInputs = Array.from(document.querySelectorAll('input[type=\"file\"]')).map(i => ({
          id: i.id,
          name: i.name,
          class: i.className,
          visible: i.offsetParent !== null
        }));
        return {
          count: fileInputs.length,
          inputs: fileInputs
        };
      })()`
    });
    console.log('FILE_INPUTS:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
checkFileInputs();
