const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('inbox.purelymail.com')) || tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
    if (!tab) {
      console.log('Purelymail webmail tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    function evalJs(code) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 100000);
        const handler = (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            resolve(parsed.result?.result?.value);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
      });
    }

    ws.on('open', async () => {
      console.log('Inspecting Roundcube message row elements and click behavior...');

      const inspectRes = await evalJs(`
        (async function() {
          const rows = Array.from(document.querySelectorAll('#messagelist tr, .messagelist tr, [data-uid], tr[id*="rcmrow"]'));
          const info = [];

          for (let r of rows) {
            info.push({
              id: r.id,
              uid: r.getAttribute('data-uid') || r.id,
              text: r.innerText.replace(/\\s+/g, ' ').slice(0, 100)
            });
          }

          // Let's check what iframe exists in DOM
          const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
            id: f.id,
            name: f.name,
            src: f.src,
            rect: f.getBoundingClientRect()
          }));

          // Let's test fetching _action=show for UID 2 via fetch
          let previewHtml = '';
          try {
            const uid = rows[0] ? (rows[0].getAttribute('data-uid') || '2') : '2';
            const res = await fetch('/?_task=mail&_action=show&_uid=' + uid + '&_framed=1');
            previewHtml = await res.text();
          } catch(e) {
            previewHtml = 'Error: ' + e.message;
          }

          return {
            rowsCount: rows.length,
            rows: info.slice(0, 10),
            iframes,
            previewHtmlSnippet: previewHtml.slice(0, 1500)
          };
        })()
      `);

      console.log('Roundcube debug result:', JSON.stringify(inspectRes, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
