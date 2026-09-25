const WebSocket = require('d:/AlparAi/node_modules/ws');

async function inspectJqueryEvents() {
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
        // Inspect jQuery events
        let fnStr = '';
        if (typeof $ !== 'undefined') {
          const docEvents = $._data(document, 'events');
          if (docEvents && docEvents.click) {
            const handlers = docEvents.click.filter(h => h.selector && h.selector.includes('adayfirmabutton'));
            if (handlers.length > 0) {
              fnStr = handlers[0].handler.toString();
            }
          }
          if (!fnStr) {
            const btnEvents = $._data($('#46')[0], 'events');
            if (btnEvents && btnEvents.click) {
              fnStr = btnEvents.click[0].handler.toString();
            }
          }
        }
        return fnStr.slice(0, 500) || 'NOT_FOUND';
      })()`
    });
    console.log('HANDLER_CODE:', res.result.value);
    ws.close();
  });
}
inspectJqueryEvents();
