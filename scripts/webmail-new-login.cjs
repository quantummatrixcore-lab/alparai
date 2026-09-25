const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
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
      console.log('Clicking New login... link...');
      const clickRes = await evalJs(`
        (function() {
          const links = Array.from(document.querySelectorAll('a, button'));
          const nl = links.find(l => l.innerText && l.innerText.includes('New login'));
          if (nl) {
            nl.click();
            return { clicked: true, text: nl.innerText, href: nl.href };
          }
          return { clicked: false };
        })()
      `);

      console.log('Click New login result:', clickRes);

      await new Promise(r => setTimeout(r, 2000));

      console.log('Filling form for ercument@alparai.com...');
      const fillRes = await evalJs(`
        (function() {
          const u = document.querySelector('input[name="_user"], #rcmloginuser');
          const p = document.querySelector('input[name="_pass"], #rcmloginpwd');
          const f = document.querySelector('form');
          if (u && p) {
            u.value = 'ercument@alparai.com';
            p.value = 'AlparAI_2026_045c419b0749!';
            u.dispatchEvent(new Event('input', { bubbles: true }));
            p.dispatchEvent(new Event('input', { bubbles: true }));
            if (f) {
              f.submit();
              return 'submitted';
            }
          }
          return { filled: false, url: location.href, html: document.body.innerText.slice(0, 500) };
        })()
      `);

      console.log('Fill result:', fillRes);

      await new Promise(r => setTimeout(r, 3500));

      const pageText = await evalJs('document.body.innerText');
      console.log('=== PAGE TEXT AFTER NEW LOGIN ===');
      console.log(pageText.slice(0, 2000));

      ws.close();
      process.exit(0);
    });
  });
});
