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
    const details = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find Evrak Yükleme Formu dialog or modal
        const forms = Array.from(document.querySelectorAll('form, .modal, .ui-dialog, div')).filter(d => d.innerText && d.innerText.includes('Evrak Yükleme Formu'));
        const modal = forms[forms.length - 1] || document.body;

        const selects = Array.from(modal.querySelectorAll('select')).map(s => ({
          id: s.id,
          name: s.name,
          options: Array.from(s.options).map(o => o.text.trim())
        }));

        const tables = Array.from(modal.querySelectorAll('table')).map(t => ({
          id: t.id,
          headers: Array.from(t.querySelectorAll('th')).map(th => th.innerText.trim()),
          rows: Array.from(t.querySelectorAll('tbody tr')).map(tr => tr.innerText.trim())
        }));

        const inputs = Array.from(modal.querySelectorAll('input')).map(i => ({
          id: i.id,
          type: i.type,
          name: i.name,
          value: i.value
        }));

        return {
          selects,
          tables,
          inputs: inputs.slice(0, 15),
          fullModalText: modal.innerText.replace(/\\s+/g, ' ').slice(0, 2000)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(details?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
