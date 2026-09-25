const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.id === '805A402F9316FF08ADF33A74A2ADE73F') || tabs.find(t => t.url && t.url.includes('inbox.purelymail.com'));
    if (!tab) {
      console.log('Purelymail webmail tab not found');
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
      console.log('Navigating Purelymail Webmail tab to INBOX list...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=mail&_mbox=INBOX' } }));

      await new Promise(r => setTimeout(r, 2500));

      const pageText = await evalJs('document.body.innerText');
      console.log('=== INBOX LIST PAGE TEXT ===');
      console.log(pageText.slice(0, 1500));

      console.log('\nOpening email details page (_action=show&_uid=24 - Teknopark Ön Başvuru)...');
      ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=mail&_mbox=INBOX&_uid=24&_action=show' } }));

      await new Promise(r => setTimeout(r, 3000));

      const showText = await evalJs('document.body.innerText');
      console.log('=== SHOW EMAIL PAGE TEXT ===');
      console.log(showText.slice(0, 2000));

      ws.close();
      process.exit(0);
    });
  });
});
