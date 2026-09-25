/**
 * scripts/save_kart_19_robust.cjs
 * Accurately updates Kart 19 inside its specific dialog and clicks its own save button
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const ARGE_NITELIGI = `1. Doğuş Motivasyonu ve Somut İhlal Vakası (Grok Olayı & Bağımsız Hakemlik İhtiyacı):
ALPAR AI'ın doğuş kıvılcımı, belgelenmiş ve ulusal basına yansımış somut bir yapay zeka güvenlik ve egemenlik ihlaline dayanmaktadır. Kurucu Ercüment ERDEN'in xAI firmasına ait Grok 4 modeliyle yaşadığı ve TÜRKİNFORM tarafından 25 Haziran 2026 tarihinde haberleştirilen vakada (Haber: https://turkinform.com.tr/turk-girisimcinin-yasadigi-grok-skandali-kisisel-verilerimiz-risk-altinda-mi); kapalı devre yabancı modellerin kullanıcı biyometrik ve kişisel verilerini keyfi işlediği ve sorumluluktan kaçtığı belgelenmiştir. Bu durum; otonom sistemlerde ve savunma sanayiinde yabancı bulut ve model bağımlılığının yaratacağı felaketleri açıkça ortaya koymuş; "Yapay Zekanın Bağımsız Denetçisi ve Hakemi" konumunda egemen bir altyapının (ALPAR) geliştirilmesini zorunlu kılmıştır.

2. Frascati Kriterleri ve Teknolojik Belirsizlik:
Kitle kaynaklı toplanan heterojen YZ hata verilerinin kriptografik doğrulukla sınıflandırılması, model ağırlıklarını ifşa etmeksizin Sıfır-Bilgi Kanıtları (ZKP) ile doğrulanması ve mikrodenetleyici düzeyinde sıfır gecikmeli deterministik koda dönüştürülmesi yüksek düzeyde kuramsal ve algoritmik belirsizlik içerir. Projemiz; kriptoloji, biçimsel doğrulama (formal verification) ve gömülü silikon mimarisini bir araya getirerek uluslararası Frascati Kılavuzu'nun tüm Ar-Ge gereksinimlerini eksiksiz karşılamaktadır.

3. Stratejik Volan Mimarisi (The 3-Phase Flywheel Model):
- Faz 1 (Veri Egemenliği - Sivil SaaS): AlparAI platformu, yapay zekanın "Şikayetvar / Trustpilot" modeliyle çalışır. Halihazırda indekslenmiş 3.115+ doğrulanmış hata vakası, SHA-384 parmak izi ve Merkle Ağacı ile "Hakikat Defteri"ne (Truth Ledger) işlenir.
- Faz 2 (Matematiksel Zırhlama - ZKP Core): Toplanan gerçek hata vakaları, ZKP doğrulama motorumuzun test yatağını oluşturur. Modelin gizli ağırlıklarına dokunmadan hatasızlığı matematiksel olarak ispatlayan Zero-GC motor sertleştirilir.
- Faz 3 (Savunma Otonomisi - Deep Tech): Sivil arenadaki binlerce hatadan ders alarak zırhlanan bu deterministik çekirdek, NATO STANAG 4586 uyumuyla İHA/SİHA sürü sistemlerine entegre edilir. "Verisi Sivilden, Zırhı Matematikten, İcrası Savunmadan."`;

const YENILIKCI_YONU = `1. Bağımsız Denetçi Konumlandırması (AI'ın NTSB'si ve TÜV'ü): ALPAR AI, yeni bir LLM üreticisi değil; üretilen tüm YZ modellerinin yük testini ve uygunluk sertifikasyonunu yapan bağımsız denetim altyapısıdır (IV&V). AB Yapay Zeka Yasası (EU AI Act) zorunlu 3. taraf denetim gereksinimine doğrudan cevap verir.

2. Biyolojik Ayrım (Beyin Sapı ve Korteks - MOSA Mimarisi):
- Beyin Sapı (Deterministik Refleks): Zero-GC, O(1) gecikmeli uçuş kontrolü ve Navier-Stokes rüzgar motoru. Fizik kuralları değişmedikçe bu çekirdek asla eskimez.
- Korteks (Tak-Çalıştır Zeka): Edge SLM ve görev zekası modülleri. Modüler Açık Sistem Mimarisi (MOSA) sayesinde yeni nesil yapay zeka modelleri sistemi bozmadan Hot-Swap yöntemiyle takılır.

3. Asimetrik Donanım Deflasyonu: Rakiplerin pahalı GPU ve Linux gereksinimine karşılık; sıfır-tahsisli mimarimiz sayesinde karmaşık otonom doğrulama ucuz mikrodenetleyicilerde (STM32N6) çalışır, platform maliyetlerini asimetrik olarak düşürür.

4. Bare-Metal Sıfır-Kopya İletişim: 64-byte L1-önbellek hizalı lock-free paylaşımlı bellek halka tamponu ile mikrodenetleyici düzeyinde 100 nanosaniyelik veri aktarımı sağlanır.`;

const MILLI_HEDEF = `T.C. Cumhurbaşkanlığı Dijital Dönüşüm Ofisi ve T.C. Sanayi ve Teknoloji Bakanlığı tarafından yayımlanan Ulusal Yapay Zeka Stratejisi (UYZS) hedefleri ve Savunma Sanayii Başkanlığı (SSB) derin teknoloji vizyonu doğrultusunda; kritik kamu altyapıları, savunma sanayii, bankacılık ve sağlık sektörlerinde kullanılacak yapay zeka sistemlerinin yabancı bulut platformlarına ve denetim mekanizmalarına bağımlı kalmaksızın, milli ve egemen kriptografik standartlarla denetlenmesini, belgelendirilmesini ve siber egemenliğimizin korunmasını sağlayacaktır.`;

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
    // Make sure all old dialogs are closed first
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    await sleep(1000);

    console.log('--- Step 1: Click Button 19 (Proje Nitelikleri) ---');
    await send('Runtime.evaluate', { expression: `document.getElementById('19').click()` });
    await sleep(2500);

    console.log('--- Step 2: Target Kart 19 Dialog and Inject Texts ---');
    const updateRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = Array.from(document.querySelectorAll('.ui-dialog')).find(d => d.innerText && d.innerText.includes('Proje Nitelikleri'));
        if (!dialog) return { ok: false, error: 'Kart 19 Dialog not found' };

        const argeEl = dialog.querySelector('#ArgeNiteligi, textarea[name="ArgeNiteligi"]');
        const yenilikEl = dialog.querySelector('#YenilikciYonu, textarea[name="YenilikciYonu"]');
        const milliEl = dialog.querySelector('#MilliHedef_Uygunluk_ED, textarea[name="MilliHedef_Uygunluk_ED"]');

        if (!argeEl || !yenilikEl || !milliEl) {
          return { ok: false, error: 'One or more textareas missing in dialog' };
        }

        argeEl.focus();
        argeEl.value = ${JSON.stringify(ARGE_NITELIGI)};
        argeEl.dispatchEvent(new Event('input', { bubbles: true }));
        argeEl.dispatchEvent(new Event('change', { bubbles: true }));

        yenilikEl.focus();
        yenilikEl.value = ${JSON.stringify(YENILIKCI_YONU)};
        yenilikEl.dispatchEvent(new Event('input', { bubbles: true }));
        yenilikEl.dispatchEvent(new Event('change', { bubbles: true }));

        milliEl.focus();
        milliEl.value = ${JSON.stringify(MILLI_HEDEF)};
        milliEl.dispatchEvent(new Event('input', { bubbles: true }));
        milliEl.dispatchEvent(new Event('change', { bubbles: true }));

        // Ensure at least one checkbox in #ProjeNitelikleri_Id is checked
        const cbs = Array.from(dialog.querySelectorAll('#ProjeNitelikleri_Id input[type="checkbox"]'));
        cbs.forEach(c => { c.checked = true; });

        // Find save button strictly inside this dialog
        const saveBtn = dialog.querySelector('.saveButton') || Array.from(dialog.querySelectorAll('a, button')).find(b => b.innerText && b.innerText.includes('Kaydet'));
        if (!saveBtn) return { ok: false, error: 'Save button not found in dialog' };

        saveBtn.click();
        return {
          ok: true,
          argeLen: argeEl.value.length,
          yenilikLen: yenilikEl.value.length,
          milliLen: milliEl.value.length,
          clicked: saveBtn.innerText.trim()
        };
      })()`,
      returnByValue: true
    });

    console.log('Update & Click Result:', JSON.stringify(updateRes?.result?.value, null, 2));

    await sleep(4000);

    // Close dialog to keep screen clean
    console.log('--- Step 3: Close Kart 19 Dialog Cleanly ---');
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });

    ws.close();
  });
}

main().catch(console.error);
