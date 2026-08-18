const http = require('http');
const crypto = require('crypto');

function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function runNativeWebSocket(wsUrl, scriptToInject) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString('base64');
    
    const options = {
      port: url.port, hostname: url.hostname, path: url.pathname,
      headers: { 'Connection': 'Upgrade', 'Upgrade': 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' }
    };
    
    const req = http.request(options);
    req.on('upgrade', (res, socket, head) => {
      let header = Buffer.alloc(14);
      const message = JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: scriptToInject, returnByValue: true } });
      const payload = Buffer.from(message, 'utf8');
      const length = payload.length;
      
      let headerLen = 0;
      header[0] = 0x81;
      if (length <= 125) { header[1] = length | 0x80; headerLen = 6; } 
      else if (length <= 65535) { header[1] = 126 | 0x80; header.writeUInt16BE(length, 2); headerLen = 8; }
      
      const mask = crypto.randomBytes(4);
      mask.copy(header, headerLen - 4);
      for (let i = 0; i < length; i++) payload[i] ^= mask[i % 4];
      
      socket.write(Buffer.concat([header.slice(0, headerLen), payload]));

      let responseData = '';
      socket.on('data', (buffer) => {
        if (buffer.length > 2) {
          const payloadLen = buffer[1] & 0x7F;
          let dataOffset = 2;
          if (payloadLen === 126) dataOffset = 4;
          else if (payloadLen === 127) dataOffset = 10;
          
          const data = buffer.slice(dataOffset).toString('utf8');
          responseData += data;
          
          if (responseData.includes('"id":1')) {
            try {
                const parsed = JSON.parse(responseData);
                if (parsed.result && parsed.result.result) resolve(parsed.result.result.value);
                else resolve(null);
                socket.destroy();
            } catch(e) { /* wait */ }
          }
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const tabs = await getTabs();
  const adminTab = tabs.find(t => t.url && t.url.includes('alparai.com/en/admin'));

  if (!adminTab) {
    console.log("Admin tab not found");
    return;
  }

  const script = `(() => { 
      // Extract main stats or text from the admin dashboard
      return document.body.innerText.substring(0, 2000); 
  })();`;
  
  const data = await runNativeWebSocket(adminTab.webSocketDebuggerUrl, script);
  console.log("DOM Data:", data);
}

run();
