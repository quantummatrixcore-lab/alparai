const http = require("http");

async function getTabs() {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
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
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const tabs = await getTabs();
  // 1. Aktif sekmeyi bul (Yeni sekme AÇILMAZ!)
  const activeTab =
    tabs.find((t) => t.type === "page" && !t.url.startsWith("devtools://")) || tabs[0];
  if (!activeTab) {
    console.error("Aktif sekme bulunamadı!");
    process.exit(1);
  }

  console.log("⚡ Hedef Aktif Sekme:", activeTab.title, activeTab.url);
  const client = new CDPClient(activeTab.webSocketDebuggerUrl);

  // 2. Sayfayı Google Pomelli'ye yönlendir
  const targetUrl = "https://labs.google.com/u/0/pomelli/website";
  console.log("🧭 Pomelli yönlendirmesi başlatılıyor:", targetUrl);
  await client.send("Page.navigate", { url: targetUrl });
  await sleep(6000); // React hidrasyonu için bekle

  // 3. DOM Analizi ve Girdi Elemanlarının Tespiti
  const domAnalysis = await client.eval(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(el => ({
        tag: el.tagName,
        type: el.type,
        placeholder: el.placeholder || el.getAttribute('aria-label') || el.getAttribute('data-placeholder'),
        className: el.className,
        id: el.id,
        value: el.value || el.innerText
      }));

      const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        text: b.innerText.trim().replace(/\\n/g, ' '),
        ariaLabel: b.getAttribute('aria-label'),
        disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
        className: b.className
      })).filter(b => b.text || b.ariaLabel);

      return {
        url: window.location.href,
        title: document.title,
        bodySnippet: document.body.innerText.slice(0, 1500),
        inputs,
        buttons
      };
    })()
  `);

  console.log("📊 DOM ANALİZ SONUCU:", JSON.stringify(domAnalysis, null, 2));

  // 4. 'Alparai Kurucu Yönetici Paneli' Prompt Enjeksiyonu
  const testPrompt =
    "Alparai Kurucu Yönetici Paneli - Çok Ajanlı Otonom Yapay Zeka Operasyon Merkezi ve Stratejik Karar Destek Platformu";

  const injectionResult = await client.eval(`
    (() => {
      const inputEl = document.querySelector('input[type="url"], input[type="text"], textarea, [contenteditable="true"]');
      if (!inputEl) return { success: false, reason: 'Girdi alanı bulunamadı' };

      inputEl.focus();
      if (inputEl.tagName === 'INPUT' || inputEl.tagName === 'TEXTAREA') {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(inputEl, '${testPrompt}');
        } else {
          inputEl.value = '${testPrompt}';
        }
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, '${testPrompt}');
      }

      // Buton tetikleme
      const actionBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('Next') || b.innerText.includes('İleri') || 
        b.innerText.includes('Generate') || b.innerText.includes('Oluştur') || 
        b.innerText.includes('Continue') || b.innerText.includes('Devam')
      );
      
      if (actionBtn && !actionBtn.disabled) {
        actionBtn.click();
      }

      return {
        success: true,
        injectedValue: inputEl.value || inputEl.innerText,
        buttonFound: !!actionBtn,
        buttonText: actionBtn ? actionBtn.innerText : null
      };
    })()
  `);

  console.log("🚀 ENJEKSİYON VE TEST SONUCU:", JSON.stringify(injectionResult, null, 2));
  console.log("🔒 KURAL 6 Uyarınca tarayıcı açık bırakıldı.");
  process.exit(0);
}

main().catch(console.error);
