/**
 * scripts/inspect_upload_modal.cjs
 * Opens Kart 46, clicks "Dosya Yükle" and inspects the upload dialog
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
    console.log('--- Step 1: Open Kart 46 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('46').click()` });
    await sleep(2000);

    console.log('--- Step 2: Inspect and Click Dosya Yükle Button ---');
    const btnInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('a, button')).find(b => b.innerText && b.innerText.trim() === 'Dosya Yükle');
        if (btn) {
          return {
            id: btn.id,
            onclick: btn.getAttribute('onclick'),
            className: btn.className,
            outerHTML: btn.outerHTML
          };
        }
        return null;
      })()`,
      returnByValue: true
    });

    console.log('Upload Button Info:', JSON.stringify(btnInfo?.result?.value, null, 2));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('a, button')).find(b => b.innerText && b.innerText.trim() === 'Dosya Yükle');
        if (btn) btn.click();
      })()`
    });

    await sleep(2500);

    const dialogState = await send('Runtime.evaluate', {
      expression: `(() => {
        const modals = Array.from(document.querySelectorAll('.modal.in, .modal.show, .ui-dialog, [role="dialog"], form')).filter(m => m.offsetParent !== null);
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(f => ({
          id: f.id,
          name: f.name,
          outerHTML: f.outerHTML
        }));
        const selects = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null).map(s => ({
          id: s.id,
          name: s.name,
          options: Array.from(s.options).map(o => ({ val: o.value, text: o.text.trim() }))
        }));

        return {
          modalsCount: modals.length,
          fileInputs,
          selects,
          visibleText: (modals[modals.length - 1] || document.body).innerText.slice(0, 1500)
        };
      })()`,
      returnByValue: true
    });

    console.log('Dialog State:', JSON.stringify(dialogState?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
