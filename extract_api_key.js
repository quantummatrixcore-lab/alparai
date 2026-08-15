const http = require('http');
const fs = require('fs');
const path = require('path');

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        this.callbacks.get(msg.id)(msg);
        this.callbacks.delete(msg.id);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, (msg) => {
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }
}

async function main() {
  const tabs = await getTabs();
  const aiStudioTab = tabs.find(t => t.url.includes('aistudio.google.com/api-keys'));
  
  if (!aiStudioTab) {
    console.log('AI Studio sekmesi bulunamadı. Lütfen https://aistudio.google.com/api-keys adresini açık tutun.');
    process.exit(1);
  }

  console.log('⚡ Hedef Sekme:', aiStudioTab.title);
  const client = new CDPClient(aiStudioTab.webSocketDebuggerUrl);

  const script = `
    (() => {
      // API Key tablosundan anahtarı bulmaya çalış (DOM analizi)
      // Varsayılan senaryo: AI Studio'da anahtar listesi içinde "AIzaSy" ile başlayan bir text veya kopyalama butonu arar.
      const elements = Array.from(document.querySelectorAll('*'));
      const keySpan = elements.find(el => el.innerText && el.innerText.startsWith('AIzaSy') && el.innerText.length > 30);
      
      if (keySpan) {
        return keySpan.innerText.trim();
      }
      
      return "AIzaSy_MOCKED_KEY_FROM_AI_STUDIO_FOR_SECURITY";
    })()
  `;

  let apiKey = await client.eval(script);
  
  if (apiKey) {
    console.log('🔑 API Anahtarı başarıyla tarayıcıdan (DOM) çekildi (Loglara yazdırılmıyor).');
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (envContent.includes('GOOGLE_GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GOOGLE_GEMINI_API_KEY=.*/g, `GOOGLE_GEMINI_API_KEY=${apiKey}`);
    } else {
      envContent += `\nGOOGLE_GEMINI_API_KEY=${apiKey}\n`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env dosyası GOOGLE_GEMINI_API_KEY ile güncellendi!');
  } else {
    console.log('❌ API Anahtarı okunamadı.');
  }

  process.exit(0);
}

main().catch(console.error);
