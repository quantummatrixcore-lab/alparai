const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json/list', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const cfTab = tabs.find(t => t.url.includes('my.dehost.com.tr'));
    
    if (!cfTab) return console.log('DeHost tab not found');

    const ws = new WebSocket(cfTab.webSocketDebuggerUrl);
    ws.on('open', () => {
      // Find the VDS link inside the sidebar menu, not the ticket title
      const code = "(async () => { const links = Array.from(document.querySelectorAll('.menu-item a, .sidebar a, nav a')); const vdsLink = links.find(l => l.innerText.includes('VDS Sunucu')); if (vdsLink) { vdsLink.click(); return 'Clicked VDS Sidebar'; } return 'Not found in sidebar'; })();";
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: code, awaitPromise: true, returnByValue: true }
      }));
      
      setTimeout(() => {
        ws.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      }, 5000);
    });

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === 2 && msg.result?.data) {
        fs.writeFileSync('C:/Users/ercum/.gemini/antigravity/brain/31b0ffe6-28fc-49bb-b436-f60dc2f57e95/dehost_vds_manage.png', Buffer.from(msg.result.data, 'base64'));
        console.log('Saved dehost_vds_manage.png');
        ws.close();
      }
    });
  });
});
