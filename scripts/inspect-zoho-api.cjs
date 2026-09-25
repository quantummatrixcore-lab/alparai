const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const zohoTab = tabs.find(t => t.url && t.url.includes('zoho.eu'));
    if (!zohoTab) {
      console.log('Zoho tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(zohoTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      const code = `
        (async function() {
          // Check if fetch to /zm/v2/ or similar works
          try {
            const cookies = document.cookie;
            const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
            
            // Try fetching folder/message list
            const folderRes = await fetch('/zm/v2/folders').then(r => r.json()).catch(e => e.message);
            const msgListRes = await fetch('/zm/v2/messages?folderId=inbox').then(r => r.json()).catch(e => e.message);

            return {
              cookiesSnippet: cookies.slice(0, 100),
              iframes,
              folderRes,
              msgListRes
            };
          } catch(e) {
            return { error: e.message };
          }
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
    });
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === 1) {
        console.log('Zoho API inspect:', JSON.stringify(parsed.result?.result?.value, null, 2));
        ws.close();
        process.exit(0);
      }
    });
  });
});
