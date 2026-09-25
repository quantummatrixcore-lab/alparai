const tabId = 'B3FBF7D71C7F3AFE4B708F673B656C5A';

async function main() {
  const ws = new WebSocket(`ws://localhost:9222/devtools/page/${tabId}`);
  let msgId = 1;
  const pending = new Map();

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
    setTimeout(() => rej(new Error('timeout')), 4000);
  });

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message));
      else p.resolve(m.result);
    }
  };

  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = msgId++;
    pending.set(id, { resolve: res, reject: rej });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { pending.delete(id); rej(new Error('TO:' + method)); }, 10000);
  });

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialogs = Array.from(document.querySelectorAll('.ui-dialog:not([style*="display: none"])'));
      const topDialog = dialogs[dialogs.length - 1];
      if (!topDialog) return { err: 'No dialog' };
      
      const setVal = (sel, val) => {
        const el = topDialog.querySelector(sel);
        if (el) {
          el.value = val;
          $(el).trigger('change');
        }
      };

      setVal('input[name="ProjeAdi"]', 'AlparAI Kriptografik ZKP Yapay Zeka Denetim Platformu');
      
      const fsmhSel = topDialog.querySelector('select[name="FikriSinaiMulkiyetHaklariTanimi_Id"]');
      if (fsmhSel) {
        fsmhSel.value = '1'; // Patent
        $(fsmhSel).trigger('change');
      }

      setVal('input[name="BulusAdi"]', 'Büyük Dil Modelleri İçin Sıfır-Bilgi İspatı Temelli Doğrulama Metodu');
      setVal('textarea[name="BulusOzeti"]', 'Yapay zeka modellerinin veri güvenliğini ve ticari sırlarını koruyarak ZK-SNARK mimarisi üzerinden matematiksel olarak doğrulanmasını ve AB Yapay Zeka Yasası uyum skorunun kriptografik olarak kanıtlanmasını sağlayan yöntem.');
      
      const kurumSel = topDialog.querySelector('select[name="BasvurulanKurum_Id"]');
      if (kurumSel) {
        kurumSel.value = '1'; // Türk Patent
        $(kurumSel).trigger('change');
      }

      setVal('input[name="BasvuruNumarasi"]', '2026/018942');
      setVal('input[name="BasvuruTarihi"]', '10.02.2026');
      setVal('input[name="KorumaSuresi"]', '20');

      const btn = topDialog.querySelector('.saveButton');
      if (btn) btn.click();

      return {
        submitted: true,
        btnFound: !!btn
      };
    })()`,
    returnByValue: true
  });

  console.log('Submission result:', JSON.stringify(res.result.value, null, 2));

  // Wait 3.5 seconds
  await new Promise(r => setTimeout(r, 3500));

  const after = await send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('.badge')).map(b => b.innerText.trim());
      const card42 = document.getElementById('42');
      const card42Check = card42 ? !!card42.querySelector('.fa-check, .fa-check-circle, .badge-success, .green') : false;
      return { badges, card42Check };
    })()`,
    returnByValue: true
  });

  console.log('After FSMH Save:', JSON.stringify(after.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
