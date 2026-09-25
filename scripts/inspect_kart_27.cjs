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
    console.log('--- Step 1: Open Kart 27 (Proje Detayı) ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('27').click()` });
    await sleep(2000);

    const k27Data = await send('Runtime.evaluate', {
      expression: `(() => {
        const textareas = Array.from(document.querySelectorAll('textarea, input[type="text"]')).map(t => ({
          id: t.id,
          name: t.name,
          valLen: (t.value || '').length,
          snippet: (t.value || '').slice(0, 200)
        }));
        return {
          textareas: textareas.filter(t => t.valLen > 0),
          contentSnippet: (document.getElementById('divAdayFirmaContent') || document.body).innerText.slice(0, 1000)
        };
      })()`,
      returnByValue: true
    });

    console.log('--- KART 27 DETAILS ---');
    console.log(JSON.stringify(k27Data?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
