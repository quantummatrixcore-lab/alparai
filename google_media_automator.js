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
  const target = process.argv[2] || 'flow'; // 'flow' veya 'vids'
  const promptText = process.argv[3] || 'Alparai AI B2B SaaS Kurumsal Tanıtım Videosu - Fütüristik ve Premium Tasarım';

  const tabs = await getTabs();
  
  let targetUrl = target === 'flow' ? 'labs.google/fx' : 'docs.google.com/videos';
  const targetTab = tabs.find(t => t.url.includes(targetUrl));
  
  if (!targetTab) {
    console.error(`Aktif ${target.toUpperCase()} sekmesi bulunamadı!`);
    process.exit(1);
  }

  console.log(`⚡ Hedef Sekme (${target}):`, targetTab.title);
  const client = new CDPClient(targetTab.webSocketDebuggerUrl);
  
  await client.send('Page.bringToFront');

  // Hedef sayfada prompt enjeksiyonu ve tetikleme
  const script = `
    (() => {
      const inputEl = document.querySelector('input[type="text"], textarea, [contenteditable="true"]');
      if (!inputEl) return { success: false, reason: 'Girdi alanı bulunamadı' };

      inputEl.focus();
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      
      if (nativeInputValueSetter && inputEl.tagName !== 'DIV') {
        nativeInputValueSetter.call(inputEl, '${promptText.replace(/'/g, "\\'")}');
      } else if (inputEl.tagName === 'DIV') {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, '${promptText.replace(/'/g, "\\'")}');
      } else {
        inputEl.value = '${promptText.replace(/'/g, "\\'")}';
      }
      
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));

      // 'Oluştur' / 'Generate' butonunu bul
      const actionBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(b => 
        b.innerText.toLowerCase().includes('generate') || 
        b.innerText.toLowerCase().includes('oluştur') ||
        b.innerText.toLowerCase().includes('create') ||
        b.getAttribute('aria-label')?.toLowerCase().includes('generate')
      );
      
      if (actionBtn && !actionBtn.disabled) {
        actionBtn.click();
      }

      return {
        success: true,
        injectedValue: '${promptText.replace(/'/g, "\\'")}',
        buttonFound: !!actionBtn
      };
    })()
  `;

  const result = await client.eval(script);
  console.log(`🚀 ${target.toUpperCase()} ENJEKSİYON SONUCU:`, JSON.stringify(result, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
