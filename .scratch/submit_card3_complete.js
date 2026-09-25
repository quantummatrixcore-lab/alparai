async function getArgeportalTabId() {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const tab = tabs.find(t => t.url?.includes('argeportal') || t.title === 'alparai.com');
  if (!tab) throw new Error('Argeportal tab not found');
  return tab.id;
}

async function main() {
  const tabId = await getArgeportalTabId();
  console.log('Connecting to Argeportal tab:', tabId);
  const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${tabId}`);
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

  // Clean open dialogs
  await send('Runtime.evaluate', {
    expression: `(() => {
      $('.ui-dialog-content').dialog('close');
      $('.ui-dialog').remove();
      $('.ui-widget-overlay').remove();
    })()`
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('Opening Card 3 (Yetkili Bilgileri)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      helper_getCard({
        color: 'color-red',
        controller: 'AdayFirma/AdayFirmaFirmaYetkilileri',
        action: 'Kart',
        value: { Id: 0, Firma_Id: 3030, AdayFirmaDoldurulacakAlan_Id: 3, ModulTipi: 1 }
      });
    })()`
  });

  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('.ui-dialog:not([style*="display: none"])');
      if (!dialog) return { err: 'No dialog' };
      
      const setVal = (sel, val) => {
        const el = dialog.querySelector(sel);
        if (el) {
          el.value = val;
          $(el).removeClass('error');
          $(el).trigger('change');
        }
      };

      setVal('input[name="Adi"]', 'ERCÜMENT');
      setVal('input[name="Soyadi"]', 'ERDEN');
      setVal('input[name="Gorevi"]', 'Kurucu & Baş Sistem Mimarı');
      setVal('input[name="YetkiliTelefon1"]', '(555) 123-45-67');
      setVal('input[name="CepTel"]', '(555) 123-45-67');
      setVal('input[name="YetkiliEmail"]', 'ercument.erden@alparai.com');
      setVal('input[name="TCNo"]', '65245305662');

      // Check all authority groups
      for (let i = 1; i <= 7; i++) {
        const cb = dialog.querySelector('#YetkiGrubu_Id_' + i);
        if (cb && typeof helper_check_Control === 'function') {
          if ($(cb).val() !== 'true') helper_check_Control(cb);
        } else if (cb) {
          cb.checked = true;
          $(cb).val('true');
          $(cb).trigger('change');
        }
      }

      const btn = dialog.querySelector('.saveButton');
      if (btn) btn.click();

      return {
        submitted: true,
        tc: '65245305662'
      };
    })()`,
    returnByValue: true
  });

  console.log('Submission result Card 3:', JSON.stringify(res.result.value, null, 2));

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
