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
          const links = Array.from(document.querySelectorAll('a[href="javascript:void 0"], button, label, input'));
          const imapSource = links.find(l => l.innerText && l.innerText.includes('IMAP account'));
          const purelyDest = links.filter(l => l.innerText && l.innerText.includes('Purelymail user'))[1] || links.find(l => l.innerText && l.innerText.includes('Purelymail user'));
          
          let clickedSource = false;
          let clickedDest = false;

          // Find interactive elements
          const allElements = Array.from(document.querySelectorAll('*'));
          for (let el of allElements) {
            if (el.innerText === 'IMAP account') {
              el.click();
              clickedSource = true;
            }
          }
          const purelyEls = allElements.filter(el => el.innerText === 'Purelymail user');
          if (purelyEls.length >= 2) {
            purelyEls[1].click();
            clickedDest = true;
          }

          // Now click Next
          const nextBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a')).find(b => b.innerText && b.innerText.trim() === 'Next');
          if (nextBtn) {
            nextBtn.click();
            return { clickedSource, clickedDest, clickedNext: true };
          }
          return { clickedSource, clickedDest, clickedNext: false };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Step 1 result:', parsed.result?.result?.value);
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: 'JSON.stringify({ url: location.href, text: document.body.innerText })', returnByValue: true } }));
        }, 2000);
      }
      if (parsed.id === 2) {
        const info = JSON.parse(parsed.result?.result?.value || '{}');
        console.log('=== PAGE URL AFTER NEXT ===', info.url);
        console.log('=== PAGE CONTENT AFTER NEXT ===');
        console.log(info.text ? info.text.slice(0, 3000) : 'No content');
        ws.close();
        process.exit(0);
      }
    });
  });
});
