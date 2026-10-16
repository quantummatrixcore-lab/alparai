const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!tab) {
      console.log('Purelymail tab not found');
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
      console.log('Filling and clicking #loginButton for ercument.erden@alparai.com...');
      
      const submitRes = await evalJs(`
        (function() {
          const emailInput = document.querySelector('#emailInput');
          const passInput = document.querySelector('#passwordInput');
          const loginBtn = document.querySelector('#loginButton');

          if (emailInput && passInput && loginBtn) {
            emailInput.value = 'ercument.erden@alparai.com';
            passInput.value = '';
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            passInput.dispatchEvent(new Event('change', { bubbles: true }));

            loginBtn.click();
            return { success: true };
          }
          return { success: false };
        })()
      `);

      console.log('Click login result:', submitRes);

      await new Promise(r => setTimeout(r, 4500));

      const pageInfo = await evalJs(`
        JSON.stringify({
          url: location.href,
          text: document.body.innerText.slice(0, 2500)
        })
      `);

      const parsedInfo = JSON.parse(pageInfo || '{}');
      console.log('=== PAGE URL AFTER LOGIN ===', parsedInfo.url);
      console.log('=== PAGE TEXT AFTER LOGIN ===');
      console.log(parsedInfo.text);

      ws.close();
      process.exit(0);
    });
  });
});
