const WebSocket = require('d:/AlparAi/node_modules/ws');

async function inspectMainContent() {
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
      expression: `(() => {
        const main = $('#main');
        const text = main.text().replace(/\\s+/g, ' ').trim();
        const inputs = Array.from(main.find('input, button, a')).map(el => ({
          tag: el.tagName,
          id: el.id,
          name: el.name,
          text: el.innerText ? el.innerText.trim() : el.value,
          class: el.className
        }));
        const tables = Array.from(main.find('table tr')).map(r => r.innerText.replace(/\\s+/g, ' ').trim());
        return JSON.stringify({
          textSnippet: text.slice(0, 1000),
          inputsCount: inputs.length,
          inputs: inputs.slice(0, 15),
          tables: tables.slice(0, 15)
        });
      })()`
    });
    console.log('MAIN_INSPECT:', res.result.value);
    ws.close();
  });
}
inspectMainContent();
