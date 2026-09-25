const WebSocket = require('ws');

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) return;
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = ++id;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === curId) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.on('open', async () => {
    const data = await send('Runtime.evaluate', {
      expression: `(() => {
        return typeof window.helper_adayfirma_modal_create === 'function' ? window.helper_adayfirma_modal_create.toString() : 'not a function';
      })()`,
      returnByValue: true
    });

    console.log('--- MODAL CREATE FUNCTION ---');
    console.log(data?.result?.value);
    ws.close();
  });
}

main().catch(console.error);
