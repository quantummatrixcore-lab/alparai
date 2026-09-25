const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const purelyTab = tabs.find(t => t.url && t.url.includes('purelymail.com') && !t.url.includes('inbox.purelymail.com')) || tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!purelyTab) {
      console.log('Purelymail tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(purelyTab.webSocketDebuggerUrl);

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
      console.log('Navigating to Purelymail users page (https://purelymail.com/manage/users)...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://purelymail.com/manage/users' } }));

      await new Promise(r => setTimeout(r, 2500));

      const pageText = await evalJs('document.body.innerText');
      console.log('=== USERS PAGE TEXT ===');
      console.log(pageText.slice(0, 1500));

      ws.close();
      process.exit(0);
    });
  });
});
