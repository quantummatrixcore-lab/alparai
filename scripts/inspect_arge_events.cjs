const WebSocket = require('d:/AlparAi/node_modules/ws');

async function inspectEvents() {
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
        // Check if jQuery exists
        if (typeof $ !== 'undefined') {
          // Trigger jQuery click on #46
          $('#46').trigger('click');
          return 'JQUERY_TRIGGERED_CLICK_ON_46';
        }
        return 'NO_JQUERY';
      })()`
    });
    console.log('JQUERY_RES:', res.result.value);

    await new Promise(r => setTimeout(r, 2500));

    const checkRes = await send('Runtime.evaluate', {
      expression: `(() => {
        // Look for open dialogs or dynamic containers
        const dynamicContent = Array.from(document.querySelectorAll('#formdiv, #dialog, .ui-dialog-content, #AdayFirmaProjeGerekliEvrak, [id*=\"Evrak\"], [id*=\"evrak\"]')).map(el => ({
          id: el.id,
          text: el.innerText ? el.innerText.slice(0, 300) : ''
        }));
        return JSON.stringify(dynamicContent);
      })()`
    });
    console.log('DYNAMIC_CONTENT:', checkRes.result.value);
    ws.close();
  });
}
inspectEvents();
