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

async function extractJulesInfo() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            return JSON.stringify({
              localStorage: { ...localStorage },
              sessionStorage: { ...sessionStorage },
              html: document.body.innerHTML.substring(0, 500)
            });
          })()
        `,
        returnByValue: true
      });
      
      console.log(result.result.value);
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

extractJulesInfo();
