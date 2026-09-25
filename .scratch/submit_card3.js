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

      setVal('input[name="Adi"]', 'Ercüment');
      setVal('input[name="Soyadi"]', 'ERDEN');
      setVal('input[name="Gorevi"]', 'Kurucu & Baş Sistem Mimarı');
      setVal('input[name="YetkiliTelefon1"]', '(555) 123-45-67');
      setVal('input[name="CepTel"]', '(555) 123-45-67');
      setVal('input[name="YetkiliEmail"]', 'ercument.erden@alparai.com');

      // Check all authority groups
      for (let i = 1; i <= 7; i++) {
        const cb = topDialog.querySelector('#YetkiGrubu_Id_' + i);
        if (cb && typeof helper_check_Control === 'function') {
          if ($(cb).val() !== 'true') helper_check_Control(cb);
        } else if (cb) {
          cb.checked = true;
          $(cb).val('true');
          $(cb).trigger('change');
        }
      }

      const form = topDialog.querySelector('form');
      const serialized = form ? $(form).serialize() : null;

      const btn = topDialog.querySelector('.saveButton');
      if (btn) btn.click();

      return {
        submitted: true,
        serialized
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
      const card3 = document.getElementById('3');
      const card3Check = card3 ? !!card3.querySelector('.fa-check, .fa-check-circle, .badge-success, .green') : false;
      const alerts = Array.from(document.querySelectorAll('.alert, .gritter-item, .ui-state-error')).map(a => a.innerText.trim());
      return { badges, card3Check, alerts };
    })()`,
    returnByValue: true
  });

  console.log('After Card 3 Save:', JSON.stringify(after.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
