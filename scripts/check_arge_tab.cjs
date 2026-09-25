const http = require('http');
const WebSocket = require('ws'); // check if ws is available, or use native/custom

http.get('http://127.0.0.1:9222/json/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const argeTab = tabs.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!argeTab) {
      console.log('Argeportal tab not found');
      return;
    }
    console.log('Found Argeportal tab:', argeTab.title, argeTab.url);
    console.log('WebSocket Debugger URL:', argeTab.webSocketDebuggerUrl);
  });
});
