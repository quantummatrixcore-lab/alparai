const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11') || tabs.find(t => t.url && t.url.includes('purelymail'));
    if (!tab) {
      console.log('Tab not found');
      process.exit(1);
    }
    console.log('Using tab:', tab.title, tab.url);
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    function send(id, method, params) {
      ws.send(JSON.stringify({ id, method, params }));
    }

    ws.on('open', () => {
      send(1, 'Page.navigate', { url: 'https://inbox.purelymail.com/?_task=logout' });
    });

    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        setTimeout(() => {
          send(2, 'Page.navigate', { url: 'https://inbox.purelymail.com' });
        }, 1500);
      }
      if (parsed.id === 2) {
        setTimeout(() => {
          const code = `
            (function() {
              const u = document.querySelector('input[name="_user"], #rcmloginuser');
              const p = document.querySelector('input[name="_pass"], #rcmloginpwd');
              const f = document.querySelector('form');
              if (u && p) {
                u.value = 'ercument@alparai.com';
                p.value = 'AlparAI_2026_045c419b0749!';
                if (f) f.submit();
                return 'login_submitted';
              }
              return 'inputs_not_found';
            })()
          `;
          send(3, 'Runtime.evaluate', { expression: code, returnByValue: true });
        }, 1500);
      }
      if (parsed.id === 3) {
        console.log('Login action:', parsed.result?.result?.value);
        setTimeout(() => {
          send(4, 'Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
        }, 3500);
      }
      if (parsed.id === 4) {
        console.log('=== LOGGED IN WEBMAIL TEXT ===');
        console.log(parsed.result?.result?.value);
        ws.close();
        process.exit(0);
      }
    });
  });
});
