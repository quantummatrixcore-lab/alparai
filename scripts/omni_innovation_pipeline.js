const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Hedef AI Modellerinin (Platformların) WebSocket injection kuralları
const AI_ENGINES = [
  { 
    name: "Qwen", 
    match: "chat.qwen.ai", 
    inputSelector: "textarea", 
    submitEvent: "Enter" 
  },
  { 
    name: "DeepSeek", 
    match: "chat.deepseek.com", 
    inputSelector: "textarea", 
    submitEvent: "Enter" 
  },
  { 
    name: "ChatGPT", 
    match: "chatgpt.com", 
    inputSelector: "#prompt-textarea", 
    submitEvent: "Enter" 
  },
  { 
    name: "Claude", 
    match: "claude.ai", 
    inputSelector: "[contenteditable='true']", 
    submitEvent: "Enter" 
  }
];

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
      const message = JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: scriptToInject, returnByValue: true, awaitPromise: true } });
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

async function startPipeline(prompt) {
  console.log("🐺 OMNI-INNOVATION PIPELINE BAŞLATILDI");
  const tabs = await getTabs();
  const poolFile = path.join(__dirname, 'memory', 'innovation_pool.json');
  
  let innovationPool = [];
  if (fs.existsSync(poolFile)) {
    innovationPool = JSON.parse(fs.readFileSync(poolFile, 'utf8'));
  }
  
  // Find matching tabs
  for (const engine of AI_ENGINES) {
    const targetTabs = tabs.filter(t => t.url && t.url.includes(engine.match));
    for (const tab of targetTabs) {
      console.log(`[+] Enjekte ediliyor: ${engine.name} (${tab.title})`);
      
      const script = `(async () => {
        return new Promise((resolve) => {
          const input = document.querySelector("${engine.inputSelector}");
          if (!input) return resolve("HATA: Girdi alanı bulunamadı.");
          
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
          if(nativeInputValueSetter) {
             nativeInputValueSetter.call(input, ${JSON.stringify(prompt)});
          } else {
             input.value = ${JSON.stringify(prompt)};
          }
          
          input.dispatchEvent(new Event('input', { bubbles: true }));
          
          setTimeout(() => {
            const enterEvent = new KeyboardEvent('keydown', {
              bubbles: true, cancelable: true, keyCode: 13, key: 'Enter', code: 'Enter'
            });
            input.dispatchEvent(enterEvent);
            resolve("BASARILI");
          }, 500);
        });
      })();`;
      
      try {
        const result = await runNativeWebSocket(tab.webSocketDebuggerUrl, script);
        if (result === "BASARILI") {
          innovationPool.push({
            model: engine.name,
            timestamp: new Date().toISOString(),
            status: "PROMPT_SENT_WAITING_FOR_ANSWER",
            url: tab.url
          });
        }
      } catch (e) {
        console.log(`[-] Hata (${engine.name}):`, e.message);
      }
    }
  }
  
  fs.writeFileSync(poolFile, JSON.stringify(innovationPool, null, 2));
  console.log("✅ Görevler memory/innovation_pool.json dosyasına eklendi. Omni-Oracle'lar çalışıyor...");
}

// Komut satırından prompt al
const userPrompt = process.argv[2] || "AlparAI projesi için en uçuk, en inovatif ve yıkıcı (disruptive) teknik mimari fikriniz nedir?";
startPipeline(userPrompt);
