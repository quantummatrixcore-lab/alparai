const WebSocket = require('ws');
const fs = require('fs');

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

async function huntApiKey() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            const html = document.documentElement.outerHTML;
            
            // Look for AIza... keys (Google Cloud API Keys)
            const aizaMatches = html.match(/AIza[a-zA-Z0-9_\\-]{35}/g) || [];
            
            // Look for OAuth Bearer tokens (ya29...)
            const bearerMatches = html.match(/ya29\\.[a-zA-Z0-9_\\-]+/g) || [];
            
            // Look for standard API key variables in window
            let globalKeys = [];
            for (let key in window) {
              try {
                if (typeof window[key] === 'string' && window[key].startsWith('AIza')) {
                  globalKeys.push(key + ' = ' + window[key]);
                }
              } catch (e) {}
            }
            
            return {
              aiza: Array.from(new Set(aizaMatches)),
              bearer: Array.from(new Set(bearerMatches)),
              globals: globalKeys
            };
          })()
        `,
        returnByValue: true
      });
      
      console.log(JSON.stringify(result.result.value, null, 2));
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

huntApiKey();
