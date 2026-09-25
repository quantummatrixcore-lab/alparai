/**
 * scripts/inspect_k19_save_fn.cjs
 * Inspects Kart 19 form and save button function
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
    console.log('--- Step 1: Open Kart 19 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('19').click()` });
    await sleep(2500);

    const k19Buttons = await send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = Array.from(document.querySelectorAll('.ui-dialog')).find(d => d.innerText && d.innerText.includes('Proje Nitelikleri'));
        if (!dialog) return { ok: false, error: 'Dialog not found' };

        const form = dialog.querySelector('form');
        const saveBtns = Array.from(dialog.querySelectorAll('a, button, input[type="button"]')).filter(b => b.innerText && b.innerText.includes('Kaydet')).map(b => ({
          tag: b.tagName,
          id: b.id,
          text: b.innerText.trim(),
          onclick: b.getAttribute('onclick'),
          classes: b.className
        }));

        return {
          ok: true,
          formAction: form ? form.action : null,
          formId: form ? form.id : null,
          saveBtns
        };
      })()`,
      returnByValue: true
    });

    console.log('Kart 19 Save Buttons:', JSON.stringify(k19Buttons?.result?.value, null, 2));

    // Close immediately
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    ws.close();
  });
}

main().catch(console.error);
