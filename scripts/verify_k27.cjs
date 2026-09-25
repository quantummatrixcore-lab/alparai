const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    await send('Runtime.evaluate', { expression: `document.getElementById('27').click()` });
    await sleep(2500);

    const k27Val = await send('Runtime.evaluate', {
      expression: `(() => {
        const ta = document.getElementById('Detay') || document.querySelector('textarea[name="Detay"]');
        return {
          exists: !!ta,
          valLen: ta ? ta.value.length : 0,
          valSnippet: ta ? ta.value.slice(0, 300) : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Kart 27 Live Value:', JSON.stringify(k27Val?.result?.value, null, 2));

    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    ws.close();
  });
}

main().catch(console.error);
