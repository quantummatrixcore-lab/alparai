const WebSocket = require('d:/AlparAi/node_modules/ws');

async function openTab46AndInspect() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return console.log('No arge tab');
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) resolve(parsed.result);
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.on('open', async () => {
    // Click button 46
    console.log('Clicking button 46...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('46').click()`
    });

    // Wait 2 seconds for modal / content to load
    await new Promise(r => setTimeout(r, 2000));

    // Inspect visible modals, tables, file inputs
    const inspectRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const modals = Array.from(document.querySelectorAll('.modal, .portlet-body, .ui-dialog, #formdiv, div[role=\"dialog\"]')).filter(m => {
          const style = window.getComputedStyle(m);
          return style.display !== 'none' && style.visibility !== 'hidden' && m.innerText && (m.innerText.includes('Belge') || m.innerText.includes('Dosya') || m.innerText.includes('Yükle'));
        });

        const activeText = modals.map(m => m.innerText).join('\n---\n');
        
        // Find all file inputs or upload forms
        const fileInputs = Array.from(document.querySelectorAll('input[type=\"file\"], .fileupload, .btn-file')).map(f => ({
          tag: f.tagName,
          id: f.id,
          name: f.name,
          class: f.className
        }));

        // Find table rows
        const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText.trim().replace(/\\t+/g, ' | ')).filter(t => t.length > 5 && (t.includes('Zaman') || t.includes('Sunum') || t.includes('Belge') || t.includes('İş Planı') || t.includes('Ek') || t.includes('Yükle')));

        return JSON.stringify({
          activeTextSnippet: activeText.slice(0, 1000),
          fileInputs,
          rows: rows.slice(0, 20)
        });
      })()`
    });

    console.log('INSPECT_RESULT:', inspectRes.result.value);
    ws.close();
  });
}
openTab46AndInspect();
