const WebSocket = require('ws');

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

async function extractNetworkToken() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  let foundKey = false;
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Network.enable');
      await sendCommand(ws, 'Page.enable');
      
      ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.method === 'Network.requestWillBeSent') {
          const req = data.params.request;
          const headers = req.headers;
          for (let key in headers) {
            if (key.toLowerCase() === 'x-goog-api-key' || key.toLowerCase() === 'authorization' || key.toLowerCase().includes('api-key')) {
              console.log('FOUND API KEY IN REQUEST:', req.url);
              console.log(key, ':', headers[key]);
              foundKey = true;
            }
          }
        }
      });
      
      console.log('Reloading page to capture network requests...');
      await sendCommand(ws, 'Page.reload');
      
      setTimeout(() => {
        if (!foundKey) {
          console.log('No API key found in network requests after 5 seconds.');
        }
        ws.close();
      }, 5000);
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

extractNetworkToken();
