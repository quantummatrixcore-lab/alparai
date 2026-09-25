const WebSocket = require('d:/AlparAi/node_modules/ws');

async function openTab46Simple() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return console.log('No arge tab');
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) {
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
    setTimeout(() => reject(new Error('timeout: ' + method)), 8000);
  });

  ws.on('open', async () => {
    try {
      // Check current open dialogs or modals before click
      console.log('Evaluating...');
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.getElementById('46');
          if (btn) btn.click();
          return 'CLICKED_46';
        })()`
      });
      console.log('Click result:', res);

      // Wait 3 seconds
      await new Promise(r => setTimeout(r, 3000));

      const afterRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const modals = Array.from(document.querySelectorAll('.bootbox, .modal, .ui-dialog, div[tabindex=\"-1\"], div.k-window')).map(m => m.innerText);
          const visibleTables = Array.from(document.querySelectorAll('table')).map(t => t.innerText.replace(/\\n+/g, ' | '));
          return JSON.stringify({
            modals,
            tablesCount: visibleTables.length,
            tableSnippets: visibleTables.filter(t => t.includes('Belge') || t.includes('Dosya') || t.includes('Zaman'))
          });
        })()`
      });
      console.log('AFTER_CLICK:', afterRes.result.value);
    } catch(e) {
      console.error('ERR:', e.message);
    } finally {
      ws.close();
    }
  });
}
openTab46Simple();
