/**
 * scripts/inspect_dosya_ekle_dialog.cjs
 * Inspects all elements inside the "Dosya Ekle" modal
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
    const dialogDetails = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = Array.from(document.querySelectorAll('.ui-dialog, .modal')).find(d => d.innerText && d.innerText.includes('Dosya Ekle'));
        if (!modal) return { ok: false, error: 'Dosya Ekle modal not found' };

        const inputs = Array.from(modal.querySelectorAll('input, select, button, a')).map(el => ({
          tag: el.tagName,
          id: el.id,
          name: el.name,
          type: el.type,
          text: el.innerText.trim(),
          classes: el.className
        }));

        return {
          ok: true,
          modalId: modal.id,
          inputs,
          modalText: modal.innerText.replace(/\\s+/g, ' ').slice(0, 1500)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(dialogDetails?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
