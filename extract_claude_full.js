const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const targetTabId = 'D55CC5CFA81841F8820C275C4106F62F'; // Claude Session tab

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
            } catch(e) { }
          }
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function extract() {
  try {
    const tabs = await getTabs();
    const claudeTab = tabs.find(t => t.id === targetTabId);
    if (!claudeTab) {
      console.log("Claude sekmesi bulunamadı!");
      return;
    }
    
    const script = `(() => {
      // Find the main chat container or just return body text
      // We will try to extract clean text.
      return document.body.innerText;
    })();`;
    
    const res = await runNativeWebSocket(claudeTab.webSocketDebuggerUrl, script);
    
    if (res) {
        fs.writeFileSync(path.join(__dirname, 'claude_full_dump.txt'), res, 'utf8');
        console.log("SUCCESS: Saved to claude_full_dump.txt. Length: " + res.length + " chars.");
    } else {
        console.log("FAILED to extract text.");
    }
  } catch (e) {
    console.error(e);
  }
}

extract();
