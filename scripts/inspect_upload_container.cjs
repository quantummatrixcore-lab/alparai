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
    const details = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Aşağıda sisteme yükleyebileceğiniz evrak listesi'));
        if (!el) return 'Element not found';

        // Find parent container or dialog
        let parent = el;
        while (parent && !parent.classList.contains('modal') && !parent.classList.contains('ui-dialog') && !parent.id.includes('Kart') && parent !== document.body) {
          parent = parent.parentElement;
        }

        const target = parent || el;
        return {
          id: target.id,
          className: target.className,
          outerHTMLSnippet: target.outerHTML.slice(0, 3000)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(details?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
