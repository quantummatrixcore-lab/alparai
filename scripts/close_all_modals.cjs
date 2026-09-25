/**
 * scripts/close_all_modals.cjs
 * Closes all open in-page jQuery UI dialogs, modals, and popups in Argeportal
 */

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
    console.log('--- Closing all in-page popup dialogs ---');
    const closeRes = await send('Runtime.evaluate', {
      expression: `(() => {
        let count = 0;

        // Method 1: Click all X / close buttons on ui-dialogs
        const closeButtons = Array.from(document.querySelectorAll('.ui-dialog-titlebar-close, .jarviswidget-delete-btn, .closeButton, [data-dismiss="modal"]'));
        closeButtons.forEach(btn => {
          try {
            btn.click();
            count++;
          } catch(e) {}
        });

        // Method 2: If jQuery UI dialog is used, call destroy or close
        if (window.$) {
          $('.ui-dialog-content').each(function() {
            try {
              $(this).dialog('close');
              count++;
            } catch(e) {}
          });
          $('.modal').each(function() {
            try {
              $(this).modal('hide');
              count++;
            } catch(e) {}
          });
        }

        return { closedCount: count };
      })()`,
      returnByValue: true
    });

    console.log('Close Result:', JSON.stringify(closeRes?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
