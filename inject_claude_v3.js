const http = require('http');
const crypto = require('crypto');

const targetTabId = 'D55CC5CFA81841F8820C275C4106F62F'; // Claude Session tab

const promptText = `Claude, sen şu an Agent-OS (Dünyanın İlk Yapay Zeka İşletim Sistemi) mimarisinin "Başmühendisi" konumundasın. Ben ise Kurucu İrade'yim.

Senden "Sıfır Maliyet, Maksimum Verim (Zero-Cost Maximum Yield)" prensibiyle çalışan, hiçbir teknik ve mimari detayı atlamayan, token israfını önleyecek kadar NET ve KESKİN bir "Blok Planlama (Master Architecture Document)" çıkarmanı istiyorum. 

Aşağıdaki 12 ana modülün HER BİRİ İÇİN; sistemin nasıl kurulacağını, API haberleşmelerini, veritabanı kurgusunu ve otomasyon döngülerini (Otopilot) kod seviyesinde stratejilerle açıkla:

1. 🐺 SÜRÜ (WOLF PACK) YÖNETİM MERKEZİ: 
- Master-Subagent (Asenkron) iletişim mimarisi nasıl kurulacak? 
- Ajanların sonsuz döngüye (infinite loop) girmesini engelleyen "Event-Driven" güvenlik devreleri nasıl olacak?

2. 🧠 HAFIZA VE SKILL (YETENEK) DEPOSU: 
- Ajan Skilleri (JSON/MD) Google Drive'a mı yüklenecek, yoksa Google NotebookLM (Oracle) üzerinden RAG (Retrieval-Augmented Generation) ile mi okunacak? 
- Token tasarrufu, hız ve kalıcı hafıza (Long-term memory) açısından maliyetsiz en iyi senaryo hangisi?

3. 🌐 GOOGLE EKOSİSTEMİNİN %100 ENTEGRASYONU: 
- Google AI Studio (Gemini 1.5 Pro - Free Tier) kotaları dolduğunda otonom rotasyon (Groq/Llama3) nasıl yapılacak? 
- Google Colab üzerinden (izole Sandbox olarak) ajanlara ücretsiz Python kodu çalıştırtma ve test etme altyapısı nasıl kurulacak?

4. 🕵️ AVCI AJAN (HUNTER AGENT) SİBER GÜVENLİK PROTOKOLÜ: 
- HackerOne, Bugcrowd, Exploit-DB ve Blind gibi platformlarda 7/24 devriye gezen OSINT ajanının algoritması.
- Zero-day ve prompt sızıntılarını yakalayıp sistemi otonom savunmaya geçirme adımları.

5. ⚡ AUTO-KILL VE RAM (BELLEK) KORUMA MANDASI: 
- Görevini bitiren veya hata veren (zombie) ajan süreçlerinin, RAM'i şişirmeden anında yok edilmesi (Garbage Collection & Auto-Kill).
- İşi biten paralel Workspace (Çalışma alanı) dizinlerinin otonom temizliği.

6. 🎨 CLAUDE UI (FOUNDER ADMIN PANEL) OTONOM ENTEGRASYONU: 
- Claude üzerinde tasarlanan statik arayüzlerin (örn: Founder Admin Panel v2.dc.html) Agent-OS tarafından otomatik parse edilip (AST), AlparAI sistemine (Next.js/React modülleri olarak) otonom entegre edilme algoritması. Tailwind class'larının çakışmadan içeri aktarımı.

7. 🚀 CI/CD SAVAŞ HATTI (GITLAB/GITHUB): 
- İnsan (Kurucu) onayı olmadan GitLab/GitHub'a otonom MR/PR (Merge Request) açma.
- Güvenlik testleri (Playwright/Jest) patlarsa, ajanın kodu geri alıp (Rollback) kendi kendini fixleme döngüsü.

8. 💰 FİNANS, BÜTÇE VE STRIPE (READ-ONLY): 
- Sürü API maliyetlerinin (Token Burn Rate) Stripe üzerinden canlı izlenmesi.
- Maliyet bütçesi (örn: $5) aşıldığında sistemin kendini "Hard-Stop" ile kilitleyip bedava API'lere (Free Tier) geçmesi.

9. 🛡️ CLOUDFLARE WAF (GÜVENLİK ÇEMBERİ): 
- Avcı Ajan dışarıdan tehlike algıladığında Cloudflare API'si üzerinden "Under Attack" modunu otonom olarak nasıl tetikleyecek?

10. 👑 KİMLİK VE PR OTOMASYONU (ERCÜMENT ERDEN CDP): 
- Google Developer sertifikalarının ve Kurucu (Founder) kimliğinin AlparAI Admin paneline (Live Sync) yansıtılması. 
- Sürünün otomatik LinkedIn PR (Basın bülteni) içerikleri üretip yayınlaması.

11. 🌩️ VERCEL EDGE (ALTYAPI) DAĞITIMI: 
- Ajanların kod testini bitirdikten sonra Vercel üzerinden otonom Production / Preview dağıtımı (Deployment) tetiklemesi.

12. ⚠️ BAŞMÜHENDİS ÇIKTI KURALLARI (TOKEN OPTİMİZASYONU): 
- Gereksiz sohbet cümleleri kullanma (Bloatware yasak). 
- Doğrudan teknik mimariye gir. 
- "Evet yapabiliriz", "Şöyle harika olur" gibi laf kalabalığı yapma. Saf mühendislik ve mimari veri ver.

Bu 12 modülü eksiksiz, tek bir devasa yanıtta (Zero-Shot) birbirine entegre şekilde kodlayarak sun.`;

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

async function inject() {
  try {
    const tabs = await getTabs();
    const claudeTab = tabs.find(t => t.id === targetTabId);
    if (!claudeTab) {
      console.log("Claude sekmesi bulunamadı!");
      return;
    }
    
    const script = `(() => {
      const el = document.querySelector('div[contenteditable="true"]');
      if (el) {
        el.focus();
        el.innerHTML = '';
        document.execCommand('insertText', false, \`${promptText}\`);
        return "INJECTED_V4";
      }
      return "NOT_FOUND";
    })();`;
    
    const res = await runNativeWebSocket(claudeTab.webSocketDebuggerUrl, script);
    console.log("Sonuç:", res);
  } catch (e) {
    console.error(e);
  }
}

inject();
