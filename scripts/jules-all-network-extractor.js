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

async function extractAllNetwork() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  let requests = [];
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Network.enable');
      await sendCommand(ws, 'Page.enable');
      
      ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.method === 'Network.requestWillBeSent') {
          const req = data.params.request;
          requests.push({ url: req.url, headers: req.headers });
        }
      });
      
      await sendCommand(ws, 'Page.reload');
      
      setTimeout(() => {
        const julesReqs = requests.filter(r => r.url.includes('jules'));
        console.log('Jules Requests:', JSON.stringify(julesReqs, null, 2));
        ws.close();
      }, 5000);
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

extractAllNetwork();
