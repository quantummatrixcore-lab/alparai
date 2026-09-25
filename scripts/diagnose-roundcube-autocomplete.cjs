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
      console.log('Connected to Roundcube tab CDP.');

      // Enable Network and Console events
      await sendCmd('Network.enable', {});
      await sendCmd('Console.enable', {});

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.method === 'Network.responseReceived') {
          const params = parsed.params;
          if (params.response.status >= 400) {
            console.log(`[NETWORK ERROR] ${params.response.status} ${params.response.url}`);
          }
        }
      });

      // Type into recipient field or trigger autocomplete JS evaluation
      console.log('Triggering autocomplete search for "ercu" in Roundcube tab...');
      const testResult = await evalJs(`
        (function() {
          if (window.rcmail) {
            console.log('Roundcube rcmail object found.');
            // Test autocomplete action manually
            const autocompleteRes = window.rcmail.env.autocomplete_threads || 'none';
            const addressbooks = window.rcmail.env.address_sources || [];
            return {
              task: window.rcmail.env.task,
              action: window.rcmail.env.action,
              addressbooks,
              autocompleteRes
            };
          }
          return { error: 'no rcmail' };
        })()
      `);

      console.log('RC Mail Env:', JSON.stringify(testResult, null, 2));

      // Execute auto-complete AJAX request manually to inspect exact response
      const ajaxResult = await evalJs(`
        (function() {
          return new Promise((resolve) => {
            if (!window.rcmail) return resolve('no rcmail');
            // Trigger autocomplete request
            const lock = window.rcmail.set_busy(true, 'loading');
            const reqId = window.rcmail.http_post('autocomplete', { _search: 'ercu', _single: 1 }, lock);
            setTimeout(() => {
              resolve('request sent, check network log');
            }, 1000);
          });
        })()
      `);

      console.log('Ajax trigger:', ajaxResult);
      await new Promise(r => setTimeout(r, 2000));
      ws.close();
      process.exit(0);
    });
  });
});
