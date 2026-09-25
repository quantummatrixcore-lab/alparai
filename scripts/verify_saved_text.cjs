/**
 * scripts/verify_saved_text.cjs
 * Opens Kart 15 and Kart 19, reads the live values from the database, and closes them.
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
    console.log('--- Step 1: Open Kart 15 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('15').click()` });
    await sleep(2500);

    const k15Val = await send('Runtime.evaluate', {
      expression: `(() => {
        const ta = document.getElementById('KazanimveSonuclar') || document.querySelector('textarea[name="KazanimveSonuclar"]');
        return {
          exists: !!ta,
          valLen: ta ? ta.value.length : 0,
          valSnippet: ta ? ta.value.slice(0, 300) : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Kart 15 Live Value:', JSON.stringify(k15Val?.result?.value, null, 2));

    // Close Kart 15 window immediately!
    await send('Runtime.evaluate', {
      expression: `$('.ui-dialog-content').dialog('close'); $('.closeButton, .ui-dialog-titlebar-close').click();`
    });
    await sleep(1000);

    console.log('--- Step 2: Open Kart 19 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('19').click()` });
    await sleep(2500);

    const k19Val = await send('Runtime.evaluate', {
      expression: `(() => {
        const arge = document.getElementById('ArgeNiteligi') || document.querySelector('textarea[name="ArgeNiteligi"]');
        const yenilik = document.getElementById('YenilikciYonu') || document.querySelector('textarea[name="YenilikciYonu"]');
        return {
          argeLen: arge ? arge.value.length : 0,
          argeSnippet: arge ? arge.value.slice(0, 300) : null,
          yenilikLen: yenilik ? yenilik.value.length : 0,
          yenilikSnippet: yenilik ? yenilik.value.slice(0, 300) : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Kart 19 Live Value:', JSON.stringify(k19Val?.result?.value, null, 2));

    // Close Kart 19 window immediately!
    await send('Runtime.evaluate', {
      expression: `$('.ui-dialog-content').dialog('close'); $('.closeButton, .ui-dialog-titlebar-close').click();`
    });

    ws.close();
  });
}

main().catch(console.error);
