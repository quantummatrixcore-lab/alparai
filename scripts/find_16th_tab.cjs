const WebSocket = require('d:/AlparAi/node_modules/ws');

async function getProjectButtons() {
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
        const links = Array.from(document.querySelectorAll('a, button, div.caption, .btn')).map(b => ({
          id: b.id,
          text: b.innerText ? b.innerText.trim().replace(/\\n/g, ' ') : '',
          class: b.className,
          isCheck: b.innerHTML.includes('fa-check'),
          isTimes: b.innerHTML.includes('fa-times') || b.innerHTML.includes('fa-warning')
        })).filter(x => x.text.includes('Belge') || x.text.includes('15 / 16') || x.isTimes);
        return JSON.stringify(links);
      })()`
    });
    console.log('MISSING_ITEMS:', res.result.value);
    ws.close();
  });
}
getProjectButtons();
