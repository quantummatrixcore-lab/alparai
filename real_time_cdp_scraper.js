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
  
  const devTab = tabs.find(t => t.url.includes('me.developers.google.com'));
  const driveTab = tabs.find(t => t.url.includes('drive.google.com'));

  console.log("=== OTOPİLOT CANLI CDP SIZMA RAPORU ===");

  if (devTab) {
    console.log("[+] Developer Profile sekmesi bulundu. Veri Çekiliyor...");
    const devScript = `(() => { 
        return document.body.innerText.substring(0, 1500); 
    })();`;
    const devData = await runNativeWebSocket(devTab.webSocketDebuggerUrl, devScript);
    console.log("=> Developer DOM Özet:\n", devData ? devData.substring(0,200) + '...' : "Hata");
  }

  if (driveTab) {
    console.log("\n[+] Google Drive sekmesi bulundu. Veri Çekiliyor...");
    const driveScript = `(() => { 
        const quotaMatches = document.body.innerText.match(/(\\d+[\\.,]?\\d*\\s*[KMG]B).*?(\\d+[\\.,]?\\d*\\s*[KMG]B)/i);
        return quotaMatches ? quotaMatches[0] : "Kota bilgisi bulunamadı";
    })();`;
    const driveData = await runNativeWebSocket(driveTab.webSocketDebuggerUrl, driveScript);
    console.log("=> Google Drive Kota Durumu:", driveData);
  }
}

run();
