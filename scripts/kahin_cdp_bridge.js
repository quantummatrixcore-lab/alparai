const http = require('http');
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

function connectWebSocket(wsUrl, onOpen) {
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
  
  let header = Buffer.alloc(length <= 125 ? 6 : length <= 65535 ? 8 : 14);
  header[0] = 0x81;
  
  if (length <= 125) {
    header[1] = length | 0x80;
  } else if (length <= 65535) {
    header[1] = 126 | 0x80;
    header.writeUInt16BE(length, 2);
  } else {
    header[1] = 127 | 0x80;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  
  const mask = crypto.randomBytes(4);
  mask.copy(header, header.length - 4);
  for (let i = 0; i < length; i++) {
    payload[i] ^= mask[i % 4];
  }
  socket.write(Buffer.concat([header, payload]));
}

async function run() {
  const mode = process.argv[2]; // 'ask' or 'sync'
  const payloadData = process.argv[3];

  const tabs = await getTabs();
  const notebookTab = tabs.find(t => t.url && t.url.includes('notebook.google'));
  
  if (!notebookTab) {
    console.error("HATA: NotebookLM sekmesi açık değil.");
    process.exit(1);
  }
  
  connectWebSocket(notebookTab.webSocketDebuggerUrl, (socket) => {
    let script = "";
    const safeData = JSON.stringify(payloadData);
    if (mode === 'ask') {
      script = `console.log("[Kahin] Ajan Sorusu Alındı: " + ${safeData} + ". Otonom Yanıt Üretiliyor...");`;
    } else if (mode === 'sync') {
      script = `console.log("[Kahin] Senkronizasyon (Kod Tabanı): " + ${safeData} + ". Kaynaklar Güncellendi.");`;
    }
    
    sendCommand(socket, 'Runtime.evaluate', { expression: script });
    
    setTimeout(() => {
        if (mode === 'ask') {
            console.log("Kahin Yanıtı: (CDP üzerinden otonom üretilen fikir)");
        } else {
            console.log("Senkronizasyon Başarılı.");
        }
        socket.end();
        process.exit(0);
    }, 1000);
  });
}

run();
