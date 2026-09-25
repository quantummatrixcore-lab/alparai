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
    console.log('--- Clicking Button 46 (Başvuru İçin Gerekli Proje Belgeleri) ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('46');
        if (btn) {
          btn.click();
          return 'Clicked button 46';
        }
        return 'Button 46 not found';
      })()`
    });

    await sleep(2500);

    const modalData = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find visible dialog or modal or card container
        const modal = document.querySelector('.modal.in, .modal.show, .ui-dialog, [id*="Kart"], #divAdayFirmaContent, .content-wrapper');
        const text = (modal || document.body).innerText.replace(/\\s+/g, ' ').trim();
        
        // Find tables or lists inside modal
        const rows = Array.from(document.querySelectorAll('tr, .list-group-item, table tbody tr')).map(r => r.innerText.replace(/\\s+/g, ' ').trim()).filter(Boolean);

        // Find file inputs or upload buttons
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(f => ({
          id: f.id,
          name: f.name,
          visible: f.offsetParent !== null
        }));

        const buttons = Array.from(document.querySelectorAll('.modal button, .ui-dialog button, button, a.btn')).filter(b => b.offsetParent !== null).map(b => b.innerText.trim());

        return {
          textSnippet: text.slice(0, 2000),
          rows: rows.slice(0, 15),
          fileInputs,
          visibleButtons: buttons
        };
      })()`,
      returnByValue: true
    });

    console.log('--- KART 46 DETAILS ---');
    console.log(JSON.stringify(modalData?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
