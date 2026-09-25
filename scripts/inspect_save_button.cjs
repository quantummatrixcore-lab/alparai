/**
 * scripts/inspect_save_button.cjs
 * Checks save button details for currently open card in Argeportal
 */

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
    const saveBtn = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button, a.btn, input[type="button"]')).filter(b => b.innerText && b.innerText.includes('Kaydet'));
        return btns.map(b => ({
          id: b.id,
          text: b.innerText.trim(),
          onclick: b.getAttribute('onclick'),
          className: b.className,
          outerHTML: b.outerHTML
        }));
      })()`,
      returnByValue: true
    });

    console.log('--- SAVE BUTTONS ---');
    console.log(JSON.stringify(saveBtn?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
