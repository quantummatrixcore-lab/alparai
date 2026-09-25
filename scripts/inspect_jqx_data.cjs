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
    const gridData = await send('Runtime.evaluate', {
      expression: `(() => {
        // Look for jqxGrid or any grid/table rows visible
        const grids = Array.from(document.querySelectorAll('.jqx-grid, table.table, .table-responsive')).map(g => {
          const rows = Array.from(g.querySelectorAll('tr, .jqx-grid-cell, [role="row"]')).map(r => r.innerText.trim()).filter(Boolean);
          return {
            id: g.id,
            rowsSnippet: rows.slice(0, 15)
          };
        });

        // Check if there are any uploaded files listed
        const filesListed = Array.from(document.querySelectorAll('a[href*="Dosya"], a[href*="Download"], a[href*="Indir"], .fa-file, .fa-file-pdf-o, [class*="file"]')).map(a => ({
          text: a.innerText.trim(),
          href: a.href,
          title: a.title
        }));

        // Check the preview form
        const previewBtn = document.getElementById('btnOnizlemeFormuYazdir');
        const submitBtn = document.getElementById('btnBasvuruYap');
        const islakSubmitBtn = document.getElementById('btnIslakImzaIleBasvuruYap');

        return {
          grids,
          filesListed: filesListed.slice(0, 15),
          previewBtnText: previewBtn ? previewBtn.innerText : null,
          submitBtnText: submitBtn ? submitBtn.innerText : null,
          islakSubmitBtnText: islakSubmitBtn ? islakSubmitBtn.innerText : null,
          submitBtnDisabled: submitBtn ? submitBtn.disabled : null
        };
      })()`,
      returnByValue: true
    });

    console.log('--- GRID & SUBMIT AUDIT RESULT ---');
    console.log(JSON.stringify(gridData?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
