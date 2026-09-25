const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const purelyTab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!purelyTab) {
      console.log('Purelymail tab not found!');
      process.exit(1);
    }
    const ws = new WebSocket(purelyTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      // Click 'Start new import/export' button/link
      const code = `
        (function() {
          const links = Array.from(document.querySelectorAll('a, button'));
          const btn = links.find(l => l.innerText.includes('Start new import/export'));
          if (btn) {
            btn.click();
            return 'clicked';
          }
          return 'btn_not_found';
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Click result:', parsed.result?.result?.value);
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: 'JSON.stringify({ url: location.href, text: document.body.innerText })', returnByValue: true } }));
        }, 2000);
      }
      if (parsed.id === 2) {
        const info = JSON.parse(parsed.result?.result?.value || '{}');
        console.log('=== PAGE URL AFTER CLICK ===', info.url);
        console.log('=== PAGE CONTENT AFTER CLICK ===');
        console.log(info.text ? info.text.slice(0, 3000) : 'No content');
        ws.close();
        process.exit(0);
      }
    });
  });
});
