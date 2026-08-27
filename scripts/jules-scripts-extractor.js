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

async function extractScripts() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            let scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerText).join('\\n');
            let match = scripts.match(/AIza[a-zA-Z0-9_-]{35}/);
            if (match) return match[0];
            return 'Not found';
          })()
        `,
        returnByValue: true
      });
      
      console.log('API KEY:', result.result.value);
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

extractScripts();
