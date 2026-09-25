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
          const allLinks = Array.from(document.querySelectorAll('a'));
          const imapLink = allLinks.find(a => a.innerText.trim() === 'IMAP account');
          const purelyLinks = allLinks.filter(a => a.innerText.trim() === 'Purelymail user');
          
          if (imapLink) imapLink.click();
          if (purelyLinks.length > 0) purelyLinks[0].click();

          return {
            clickedImap: !!imapLink,
            clickedPurely: purelyLinks.length > 0
          };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Select result:', parsed.result?.result?.value);
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: 'document.querySelector("main")?.innerHTML || document.body.innerText', returnByValue: true } }));
        }, 1000);
      }
      if (parsed.id === 2) {
        console.log('=== FORM HTML AFTER SELECT ===');
        console.log(parsed.result?.result?.value);
        ws.close();
        process.exit(0);
      }
    });
  });
});
