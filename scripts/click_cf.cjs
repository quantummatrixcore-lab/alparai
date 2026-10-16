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
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.navigate',
        params: { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/pages/view/alparai-com/settings' }
      }));
      setTimeout(() => {
        ws.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      }, 5000);
    });

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === 2 && msg.result?.data) {
        fs.writeFileSync('C:/Users/ercum/.gemini/antigravity/brain/31b0ffe6-28fc-49bb-b436-f60dc2f57e95/cf_settings.png', Buffer.from(msg.result.data, 'base64'));
        console.log('Saved cf_settings.png');
        ws.close();
      }
    });
  });
});
