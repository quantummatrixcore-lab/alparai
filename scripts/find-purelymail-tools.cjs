const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const purelyTab = tabs.find(t => t.url && t.url.includes('purelymail.com') && t.url.includes('manage'));
    if (!purelyTab) {
      console.log('Purelymail manage tab not found!');
      process.exit(1);
    }
    const ws = new WebSocket(purelyTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://purelymail.com/manage/tools' } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: 'document.body.innerText', returnByValue: true } }));
        }, 2000);
      }
      if (parsed.id === 2) {
        console.log('=== TOOLS PAGE CONTENT ===');
        console.log(parsed.result?.result?.value);
        ws.close();
      }
    });
  });
});
