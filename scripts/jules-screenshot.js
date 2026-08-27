const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const listener = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === id) {
        ws.removeListener('message', listener);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.on('message', listener);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function captureScreen() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const result = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
      
      const buffer = Buffer.from(result.data, 'base64');
      fs.writeFileSync('C:\\Users\\ercum\\.gemini\\antigravity\\brain\\19f96dfe-3110-4589-b342-786a5da33982\\jules.png', buffer);
      
      console.log('Screenshot saved to artifacts/jules.png');
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

captureScreen();
