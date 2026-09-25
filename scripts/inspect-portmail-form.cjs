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
      const code = `
        (function() {
          const main = document.querySelector('main') || document.querySelectorAll('.pa3')[1] || document.body;
          return {
            html: main.innerHTML
          };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Main HTML structure:');
        console.log(parsed.result?.result?.value?.html);
        ws.close();
        process.exit(0);
      }
    });
  });
});
