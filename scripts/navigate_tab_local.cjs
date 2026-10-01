const WebSocket = require('ws');
const http = require('http');

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
          if (pageTarget) resolve(pageTarget.webSocketDebuggerUrl);
          else reject(new Error('No active page target found on CDP 9222'));
        } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

async function navigateTabToLocal() {
  const wsUrl = await getWsUrl();
  console.log('Connecting to CDP WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.on('open', async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    try {
      console.log('Navigating active Chrome tab to https://app.zoom.us/wc/82704409372/join ...');
      await send('Page.navigate', { url: 'https://app.zoom.us/wc/82704409372/join' });
      await new Promise(r => setTimeout(r, 3000));
      console.log('Navigation successful!');
      ws.close();
    } catch (err) {
      console.error('CDP Navigation Error:', err);
      ws.close();
    }
  });

  ws.on('message', (rawData) => {
    try {
      const msg = JSON.parse(rawData);
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
    } catch (e) {}
  });
}

navigateTabToLocal().catch(console.error);
