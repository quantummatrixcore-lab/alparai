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
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('.adayfirmabutton')).map(b => {
          // Check if parent or preceding icon has checkmark or color
          const icon = b.querySelector('i') || b.parentElement.querySelector('i');
          return {
            id: b.id,
            text: b.innerText.trim(),
            iconClass: icon ? icon.className : null,
            buttonClass: b.className
          };
        });
        return buttons;
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(res?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
