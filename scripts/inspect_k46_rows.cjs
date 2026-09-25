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
    const rowsInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        // Look at the table of required documents in Kart 46
        const rows = Array.from(document.querySelectorAll('#widget tr, #divAdayFirmaContent tr, table tr')).filter(r => r.innerText && (r.innerText.includes('Proje Sunumu') || r.innerText.includes('Gantt'))).map(r => ({
          text: r.innerText.replace(/\\s+/g, ' ').trim(),
          buttons: Array.from(r.querySelectorAll('a, button, i')).map(b => ({
            tag: b.tagName,
            text: b.innerText.trim(),
            onclick: b.getAttribute('onclick'),
            className: b.className,
            id: b.id
          }))
        }));

        return rows;
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(rowsInfo?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
