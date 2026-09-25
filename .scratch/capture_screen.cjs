const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.captureScreenshot',
        params: { format: 'png' }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.result && resp.result.data) {
        fs.writeFileSync('D:/AlparAi/.scratch/current_screen.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Screenshot saved to D:/AlparAi/.scratch/current_screen.png');
      } else {
        console.log('Error capturing screenshot:', resp);
      }
      ws.close();
      process.exit(0);
    };
  });
});
