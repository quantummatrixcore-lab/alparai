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

      setVal('input[name="StandartLisans"]', 'ISO/IEC 42001 & ISO/IEC 27001 Yapay Zeka Yönetim Sistemi');
      setVal('input[name="HizmetAdi"]', 'Yapay Zeka Güvenlik, Doğrulama ve ZKP Denetim Süreçleri');
      setVal('input[name="AlisTarihi"]', '15.01.2026');
      setVal('input[name="VerenKurum"]', 'TSE / Uluslararası Akredite Kuruluş');

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
      const card9 = document.getElementById('9');
      const card9Check = card9 ? !!card9.querySelector('.fa-check, .fa-check-circle, .badge-success, .green') : false;
      return { badges, card9Check };
    })()`,
    returnByValue: true
  });

  console.log('After Standart Save:', JSON.stringify(after.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
