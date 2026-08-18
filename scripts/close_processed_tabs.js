const http = require('http');

console.log("[Otopilot] Kurucu Emri Uygulanıyor: İşi biten sekmeler kapatılacak...");

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function closeTab(id) {
  return new Promise((resolve) => {
    http.get(`http://localhost:9222/json/close/${id}`, (res) => {
      resolve();
    }).on('error', () => resolve()); // Ignore errors on close
  });
}

async function run() {
  const tabs = await getTabs();
  
  // Kapatılacak sekme anahtar kelimeleri (İşi bitenler)
  const targets = ['cloudflare.com', 'vercel.com', 'linkedin.com', 'github.com', 'pomelli', 'docs.google.com', 'vids', 'stripe'];
  
  let closedCount = 0;

  for (const tab of tabs) {
    if (tab.url && targets.some(t => tab.url.toLowerCase().includes(t))) {
      console.log(`[Otopilot] Kapatılıyor (İşi Bitti): ${tab.title.substring(0, 50)}`);
      await closeTab(tab.id);
      closedCount++;
    }
  }

  console.log(`\n[+] Başarılı! Toplam ${closedCount} adet sekme (işi bitenler) kapatıldı ve RAM temizlendi.`);
}

run();
