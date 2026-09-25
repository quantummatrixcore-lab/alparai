/**
 * scripts/inject_kart_15.cjs
 * Injects updated AI ecosystem problems & KPI metrics into Kart 15 (Proje Hedefleri)
 * and clicks Kaydet (F3).
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const KART_15_TEXT = `Projenin temel hedefi; yapay zeka modellerinin güvenilirliğini denetleyen ve otonom sistemlerde halüsinasyon riskini sıfırlayan 3 Aşamalı bir "Veri - Güven - Savunma Otonomisi" Volanı (Flywheel) inşa etmektir. Sistem; sivil alanda kitle kaynaklı (crowdsourced) toplanan gerçek yapay zeka hata verilerini kriptografik hakikat defterine (Truth Ledger) işlemekte, bu verilerle zırhlanan Sıfır-Bilgi Kanıtı (ZKP) ve Sıfır-Bellek Tahsisatlı (Zero-GC) deterministik motor ile NATO STANAG 4586 uyumlu askeri otonomi çekirdeği sunmaktadır.

Sayısal ve Ölçülebilir Başarı Kriterleri (KPI):
1. Doğrulanmış Hata Veri Seti Büyümesi (Faz 1): Canlı platformdaki 3.115+ doğrulanmış YZ hata vaka kütüphanesini açık kaynak @alparai/guard SDK'sı ile 18 ay sonunda 50.000+ vakaya ulaştırarak dünyanın en büyük bağımsız YZ kusur veri setini oluşturmak.
2. Uçuş ve Karar Döngüsü Gecikmesi (Faz 2): Gerçek donanım üzerinde ZKP doğrulamalı otonom karar ve refleks döngüsü gecikmesini < 1.0 milisaniye düzeyine indirmek ve O(1) deterministik zaman karmaşıklığını garanti etmek.
3. Jammer Altında Sürü Senkronizasyonu (Faz 3): Yoğun elektronik harp altında merkezi veri bağı koptuğunda, 1200 Baud dar bant askeri RF koşullarında en az 3 düğümlü İHA sürüsünün koordinasyonunu %0 paket kaybı ile sürdürmek.
4. Aerodinamik Enerji Verimliliği: Gerçek zamanlı Navier-Stokes rüzgar kestirimi algoritmasıyla klasik kontrolcülere göre batarya tüketiminde %15 net verimlilik artışı sağlamak.
5. Gömülü NPU Uyumluluğu: 1B-3B parametreli Uç Dil Modellerini (Edge SLM) 4-bit INT4 kuantizasyonla ≤128MB RAM sınırında sıfır dinamik bellek tahsisatıyla çalıştırmak.`;

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
    console.log('--- Step 1: Open Kart 15 ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('15').click()` });
    await sleep(2000);

    console.log('--- Step 2: Inject text into KazanimveSonuclar ---');
    const injectRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const ta = document.getElementById('KazanimveSonuclar') || document.querySelector('textarea[name="KazanimveSonuclar"]');
        if (!ta) return { ok: false, error: 'Textarea not found' };

        ta.focus();
        const text = ${JSON.stringify(KART_15_TEXT)};
        ta.value = text;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));

        return { ok: true, len: ta.value.length };
      })()`,
      returnByValue: true
    });

    console.log('Inject Result:', JSON.stringify(injectRes?.result?.value, null, 2));

    await sleep(1000);

    console.log('--- Step 3: Click Save Button ---');
    const saveRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const saveBtn = document.querySelector('.saveButton') || Array.from(document.querySelectorAll('a, button')).find(el => el.innerText && el.innerText.includes('Kaydet'));
        if (saveBtn) {
          saveBtn.click();
          return { ok: true, clicked: saveBtn.innerText.trim() };
        }
        return { ok: false, error: 'Save button not found' };
      })()`,
      returnByValue: true
    });

    console.log('Save Result:', JSON.stringify(saveRes?.result?.value, null, 2));

    await sleep(3000);

    // Check for message toast or alert
    const checkToast = await send('Runtime.evaluate', {
      expression: `(() => {
        const toast = document.querySelector('.toast, .alert, .message, .noty_bar, [class*="alert"]');
        return {
          toastText: toast ? toast.innerText.replace(/\\s+/g, ' ').trim() : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Toast Result:', JSON.stringify(checkToast?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
