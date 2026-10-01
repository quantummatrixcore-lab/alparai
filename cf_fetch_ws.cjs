const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json/list', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const cfTab = tabs.find(t => t.url.includes('dash.cloudflare.com'));
    
    if (!cfTab) return console.log('Cloudflare tab not found');

    const ws = new WebSocket(cfTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      const code = "(async () => { const res = await fetch('https://dash.cloudflare.com/api/v4/accounts/635ead830bc3a409e643b59e3768e9f5/pages/projects'); return await res.json(); })();";
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: code,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === 1) {
        fs.writeFileSync('cf_projects_from_browser.json', JSON.stringify(msg.result.result.value, null, 2));
        console.log('Successfully fetched from Cloudflare tab');
        ws.close();
      }
    });
  });
});
