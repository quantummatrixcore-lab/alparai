/**
 * scripts/inject_kart_27.cjs
 * Injects 18-month work packages and Gantt sync into Kart 27 (Proje Detayı) and saves.
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DETAY_TEXT = `18 AYLIK AR-GE İŞ PAKETLERİ (FAZ 0 DAHİL CANLI GANTT DAĞILIMI):

• Faz 0 (İlk 2 Hafta): Kurumsal Temel, Danışma Kurulu ve Fikri Mülkiyet Kalkanı
Teknopark kabulü, Danışma Kurulu (Prof. Dr. Musa AYGÜL & Ahmet Rıfat ALBUZ) ile resmi protokollerin imzalanması, Air-Gapped izole geliştirme istasyonunun kurulması, PCT uluslararası patent sürecinin başlatılması.

• İP-1 (Ay 1-4): Veri Toplama Çarkı, SDK Lansmanı ve ZKP Çekirdek Simülasyonu
@alparai/guard açık SDK'sının yayınlanması, 3.115 olan doğrulanmış ihlal vaka sayısının 15.000+ seviyesine çıkarılması, Merkle Tree SHA-384 doğrulama hattının kurulması, Groth16 ZKP doğrulayıcısının simülasyon stres testleri.

• İP-2 (Ay 5-9): Silikon ve Gömülü NPU Entegrasyonu (STM32N6 Portu)
Deterministik Zero-GC motorunun STM32N6 NPU ve FPGA silikonuna gömülmesi, 4-bit INT4 kuantizasyonla modelin ≤128MB RAM sınırına kilitlenmesi, laboratuvarda <1ms döngü gecikmesinin doğrulanması.

• İP-3 (Ay 10-14): STANAG 4586 Askeri RF, Jammer Dayanıklılık ve B2B Trust Badge
1200 Baud dar bant RF altında 3+ İHA ile %0 paket kayıplı sürü senkronizasyonu, B2B SaaS "AlparAI Doğrulanmış Güven Mührü" API lansmanı, akredite test laboratuvarından STANAG 4586 ön-uyumluluk raporu.

• İP-4 (Ay 15-18): Saha Uçuş Doğrulaması, Savunma Entegrasyonu ve Ticarileşme
Açık alanda tam entegre otonom sürü uçuş doğrulaması (TRL-8/9), Dinamik NPU Uyku Kalkanı ile +12 dakika batarya kazancının telemetriyle belgelenmesi, patent tescili ve en az 1 adet Savunma Sanayii Müşteri Niyet Mektubu (LoI) imzalanması.`;

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
    console.log('--- Step 1: Open Kart 27 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('27').click()` });
    await sleep(2000);

    console.log('--- Step 2: Inject into Detay ---');
    const injectRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const ta = document.getElementById('Detay') || document.querySelector('textarea[name="Detay"]');
        if (!ta) return { ok: false, error: 'Detay textarea not found' };

        ta.focus();
        ta.value = ${JSON.stringify(DETAY_TEXT)};
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));

        return { ok: true, len: ta.value.length };
      })()`,
      returnByValue: true
    });

    console.log('Inject Result:', JSON.stringify(injectRes?.result?.value, null, 2));
    await sleep(1000);

    console.log('--- Step 3: Click Save in Kart 27 ---');
    const saveRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const saveBtn = document.querySelector('.saveButton') || Array.from(document.querySelectorAll('a, button')).find(el => el.innerText && el.innerText.includes('Kaydet'));
        if (saveBtn) {
          saveBtn.click();
          return { ok: true, text: saveBtn.innerText.trim() };
        }
        return { ok: false, error: 'Save button not found' };
      })()`,
      returnByValue: true
    });

    console.log('Save Result:', JSON.stringify(saveRes?.result?.value, null, 2));
    await sleep(3000);
    ws.close();
  });
}

main().catch(console.error);
