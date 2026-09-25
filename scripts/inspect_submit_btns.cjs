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
        const b1 = document.getElementById('btnOnizlemeFormuYazdir');
        const b2 = document.getElementById('btnBasvuruYap');
        const b3 = document.getElementById('btnIslakImzaIleBasvuruYap');

        return {
          onizleme: b1 ? { onclick: b1.getAttribute('onclick'), href: b1.href, outerHTML: b1.outerHTML } : null,
          eimza: b2 ? { onclick: b2.getAttribute('onclick'), href: b2.href, outerHTML: b2.outerHTML } : null,
          islak: b3 ? { onclick: b3.getAttribute('onclick'), href: b3.href, outerHTML: b3.outerHTML } : null
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(data?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
