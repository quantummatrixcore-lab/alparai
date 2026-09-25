/**
 * scripts/save_kart_27_robust.cjs
 * Saves Kart 27 Detay inside its isolated dialog and closes cleanly.
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DETAY_TEXT = `ALPAR AI MİMARİSİ VE 18 AYLIK AR-GE İŞ PAKETLERİ (GANTT SENKRON):

1. MİMARİ KATMANLAR:
- Kriptografik ZKP Doğrulama Katmanı: Model çıkarım matrislerini Circom/SnarkJS devrelerine indirger.
- 17-Vektörlü Adversarial Stres Testi: Prompt injection, jailbreak, halüsinasyon ve sızıntı açıklarını tarar.
- Sıfır-Bellek Tahsisatlı (Zero-GC) Deterministik Çekirdek: V8 Garbage Collector baskısını sıfırlayan L1 halka tamponu ile O(1) deterministik zaman karmaşıklığı sunar.
- MOSA Modüler Mimarisi: Beyin Sapı (refleks kontrol) ve Korteks (görev zekası) ayrımı.

2. 18 AYLIK İŞ PAKETLERİ DAĞILIMI:
• Faz 0 (İlk 2 Hafta): Kurumsal Temel, Danışma Kurulu (Prof. Dr. Musa AYGÜL & Ahmet Rıfat ALBUZ) protokolleri ve PCT uluslararası patent başvurusu.
• İP-1 (Ay 1-4): @alparai/guard SDK lansmanı, doğrulanmış ihlal vakalarının 15.000+ seviyesine çıkarılması, Merkle Tree SHA-384 doğrulama hattı.
• İP-2 (Ay 5-9): STM32N6 NPU ve FPGA silikonuna gömülü Zero-GC motor entegrasyonu, 4-bit INT4 kuantizasyonla modelin ≤128MB RAM sınırına kilitlenmesi (<1ms döngü gecikmesi).
• İP-3 (Ay 10-14): STANAG 4586 Askeri RF altında 3+ İHA ile %0 paket kayıplı sürü senkronizasyonu, B2B Trust Badge lansmanı.
• İP-4 (Ay 15-18): Açık alanda otonom sürü uçuş doğrulaması (TRL-8/9), Dinamik NPU Uyku Kalkanı ile +12 dakika batarya kazancı, patent tescili ve Savunma Sanayii Müşteri Niyet Mektubu (LoI).`;

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) return;
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = ++id;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === curId) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.on('open', async () => {
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    await sleep(1000);

    console.log('--- Step 1: Open Kart 27 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('27').click()` });
    await sleep(2500);

    const updateRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = Array.from(document.querySelectorAll('.ui-dialog')).find(d => d.innerText && d.innerText.includes('Proje Detayı'));
        if (!dialog) return { ok: false, error: 'Dialog not found' };

        const ta = dialog.querySelector('#Detay, textarea[name="Detay"]');
        if (!ta) return { ok: false, error: 'Detay textarea not found' };

        ta.focus();
        ta.value = ${JSON.stringify(DETAY_TEXT)};
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));

        const saveBtn = dialog.querySelector('.saveButton') || Array.from(dialog.querySelectorAll('a, button')).find(b => b.innerText && b.innerText.includes('Kaydet'));
        if (!saveBtn) return { ok: false, error: 'Save button not found' };

        saveBtn.click();
        return { ok: true, len: ta.value.length, clicked: saveBtn.innerText.trim() };
      })()`,
      returnByValue: true
    });

    console.log('Update Result:', JSON.stringify(updateRes?.result?.value, null, 2));
    await sleep(4000);

    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    ws.close();
  });
}

main().catch(console.error);
