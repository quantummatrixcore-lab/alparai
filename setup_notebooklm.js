const http = require('http');

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
  
  // NotebookLM sekmesini bul (Eğer yoksa aktif sekmeyi kullan)
  const notebookTab = tabs.find(t => t.url.includes('notebook.google')) || tabs.find(t => t.type === 'page' && !t.url.startsWith('devtools://'));
  
  if (!notebookTab) {
    console.error('Sekme bulunamadı!');
    process.exit(1);
  }

  console.log('⚡ Hedef Sekme:', notebookTab.title, notebookTab.url);
  const client = new CDPClient(notebookTab.webSocketDebuggerUrl);
  
  // Sekmeyi ön plana getir
  await client.send('Page.bringToFront');

  // URL notebook.google değilse yönlendir
  if (!notebookTab.url.includes('notebook.google')) {
    await client.send('Page.navigate', { url: 'https://notebook.google.com/' });
    await new Promise(r => setTimeout(r, 4000));
  }

  // Kullanıcıya görsel bir Alert (Yönlendirme) enjekte et
  const alertScript = `
    (() => {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.color = '#fff';
      overlay.style.fontFamily = 'system-ui, sans-serif';
      
      const box = document.createElement('div');
      box.style.backgroundColor = '#1e1e2e';
      box.style.border = '2px solid #6366f1';
      box.style.borderRadius = '16px';
      box.style.padding = '40px';
      box.style.maxWidth = '600px';
      box.style.textAlign = 'center';
      box.style.boxShadow = '0 0 50px rgba(99,102,241,0.3)';
      
      box.innerHTML = \`
        <h1 style="color: #818cf8; font-size: 24px; margin-bottom: 20px;">🐺 Alparai Kurt Sürüsü: Hive Mind (Ana Beyin) Hazır!</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Komutanım, ajanların tüm yeteneklerini barındıran veri paketi bilgisayarınızda oluşturuldu.</p>
        <div style="background: #11111b; padding: 15px; border-radius: 8px; font-family: monospace; color: #a6e3a1; margin-bottom: 20px; word-break: break-all;">
          C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\Alparai_HiveMind.txt
        </div>
        <p style="font-size: 14px; color: #bac2de; margin-bottom: 30px;">
          Lütfen NotebookLM üzerinde <b>'Alparai Kurt Sürüsü HQ'</b> adında yeni bir not defteri oluşturun ve yukarıdaki dosyayı <b>Kaynak</b> olarak içine sürükleyin. Artık tüm ajanlarımız doğrudan bu Kahin'e danışarak kod yazacak!
        </p>
        <button id="close-wolf-alert" style="background: #818cf8; color: #11111b; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">Anlaşıldı, Kapat</button>
      \`;
      
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      
      document.getElementById('close-wolf-alert').onclick = () => {
        document.body.removeChild(overlay);
      };
    })()
  `;

  await client.eval(alertScript);
  console.log('✅ Yönlendirme arayüzü sekmeye enjekte edildi.');
  
  process.exit(0);
}

main().catch(console.error);
