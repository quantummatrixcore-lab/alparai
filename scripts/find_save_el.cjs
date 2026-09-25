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
    const elData = await send('Runtime.evaluate', {
      expression: `(() => {
        const all = Array.from(document.querySelectorAll('*')).filter(el => {
          const t = el.innerText || '';
          return t.includes('Kaydet') || t.includes('F3');
        }).map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: el.innerText.trim().slice(0, 50),
          onclick: el.getAttribute('onclick')
        }));
        return all.slice(0, 10);
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(elData?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
