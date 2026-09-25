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
      console.log('Connected to Roundcube tab CDP. Disabling broken addressbook autocomplete in user settings...');

      // Save user preferences in Roundcube: set autocomplete_addressbooks = []
      const saveRes = await evalJs(`
        (function() {
          return new Promise((resolve) => {
            if (!window.rcmail) return resolve('no rcmail');
            
            // Post settings save to disable addressbook autocomplete
            const lock = window.rcmail.set_busy(true, 'saving');
            const reqId = window.rcmail.http_post('settings/save', {
              _section: 'compose',
              _autocomplete_single_click: 0,
              _autocomplete_addressbooks: []
            }, lock);

            setTimeout(() => {
              resolve('Settings saved request dispatched');
            }, 1000);
          });
        })()
      `);

      console.log('Result:', saveRes);
      await new Promise(r => setTimeout(r, 1500));
      ws.close();
      process.exit(0);
    });
  });
});
