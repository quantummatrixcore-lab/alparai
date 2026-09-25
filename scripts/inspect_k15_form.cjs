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
    console.log('--- Clicking Button 15 (Proje Hedefleri) ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('15').click()` });
    await sleep(2000);

    const formDetails = await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.getElementById('divAdayFirmaContent') || document.body;
        const form = container.querySelector('form');
        const buttons = Array.from(container.querySelectorAll('button, a, input[type="button"], input[type="submit"]')).map(b => ({
          id: b.id,
          tag: b.tagName,
          text: (b.innerText || b.value || '').trim(),
          onclick: b.getAttribute('onclick'),
          className: b.className
        }));

        return {
          formAction: form ? form.action : null,
          formId: form ? form.id : null,
          buttons: buttons.filter(b => b.text.length > 0)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(formDetails?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
