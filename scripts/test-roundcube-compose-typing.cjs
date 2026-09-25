const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const rcTab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!rcTab) {
      console.log('Roundcube tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(rcTab.webSocketDebuggerUrl);

    function sendCmd(method, params) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 100000);
        const handler = (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            resolve(parsed.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalJs(code) {
      const res = await sendCmd('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true });
      return res?.result?.value;
    }

    ws.on('open', async () => {
      console.log('Connected to Roundcube tab CDP. Reloading compose page...');
      await evalJs(`window.location.href = "https://inbox.purelymail.com/?_task=mail&_action=compose"`);
      await new Promise(r => setTimeout(r, 2500));

      const status = await evalJs(`
        (function() {
          const input = document.querySelector('input#_to, textarea#_to, input[name="_to"]');
          if (input) {
            input.value = "ercument.erden@alparai.com";
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const alerts = Array.from(document.querySelectorAll('.toast, .ui-toast, .messagestack, div[role="alert"]')).map(e => e.innerText);
          return {
            inputValue: input ? input.value : '',
            alerts
          };
        })()
      `);

      console.log('Test compose status:', JSON.stringify(status, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
