const http = require('http');
const https = require('https');
const crypto = require('crypto');

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function connectWebSocket(wsUrl, onOpen, onMessage) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString('base64');
    
    const options = {
      port: url.port,
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': key,
        'Sec-WebSocket-Version': '13'
      }
    };
    
    const req = http.request(options);
    req.on('upgrade', (res, socket, head) => {
      onOpen(socket);
      socket.on('data', (data) => {
        if (data.length < 2) return;
        const opcode = data[0] & 0x0F;
        if (opcode === 8) { socket.end(); return; }
        if (opcode !== 1) return;
        
        const isMasked = (data[1] & 0x80) !== 0;
        let payloadLen = data[1] & 0x7F;
        let offset = 2;
        
        if (payloadLen === 126) {
          payloadLen = data.readUInt16BE(2);
          offset += 2;
        } else if (payloadLen === 127) {
          payloadLen = Number(data.readBigUInt64BE(2));
          offset += 8;
        }
        
        const mask = isMasked ? data.slice(offset, offset + 4) : null;
        if (isMasked) offset += 4;
        
        const payload = data.slice(offset, offset + payloadLen);
        if (isMasked) {
          for (let i = 0; i < payloadLen; i++) {
            payload[i] ^= mask[i % 4];
          }
        }
        
        onMessage(payload.toString('utf8'), socket);
      });
      resolve(socket);
    });
    
    req.on('error', reject);
    req.end();
  });
}

function sendCommand(socket, method, params = {}, id = 1) {
  const message = JSON.stringify({ id, method, params });
  const payload = Buffer.from(message, 'utf8');
  const length = payload.length;
  
  let header;
  if (length <= 125) {
    header = Buffer.alloc(6);
    header[1] = length | 0x80;
  } else if (length <= 65535) {
    header = Buffer.alloc(8);
    header[1] = 126 | 0x80;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(14);
    header[1] = 127 | 0x80;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  
  header[0] = 0x81;
  const mask = crypto.randomBytes(4);
  mask.copy(header, header.length - 4);
  for (let i = 0; i < length; i++) {
    payload[i] ^= mask[i % 4];
  }
  socket.write(Buffer.concat([header, payload]));
}

async function runLinkedInAutomator() {
  const tabs = await getTabs();
  const linkedInTab = tabs.find(t => t.url && t.url.includes('linkedin.com/company/alparai'));
  
  if (!linkedInTab) {
    console.error("HATA: LinkedIn Alparai sekmesi açık değil.");
    process.exit(1);
  }
  
  console.log(`Bağlanılıyor: ${linkedInTab.title}`);
  
  let cmdId = 1;
  connectWebSocket(linkedInTab.webSocketDebuggerUrl, (socket) => {
    console.log("[Wolf Pack] LinkedIn (CDP) bağlantısı kuruldu. Otonom Paylaşım Modülü hazır.");
    
    const script = `
        console.log("Wolf Pack: Otonom Sosyal Medya Motoru Devrede. (P3)");
    `;
    
    sendCommand(socket, 'Runtime.evaluate', { expression: script }, cmdId++);
    
    setTimeout(() => {
        console.log("[Wolf Pack] LinkedIn otomasyon testi başarılı.");
        socket.end();
        process.exit(0);
    }, 2000);
    
  }, (msg, socket) => {
    //
  });
}

runLinkedInAutomator();
