async function getArgeportalTabId() {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const tab = tabs.find(t => t.url?.includes('argeportal') || t.title === 'alparai.com');
  if (!tab) throw new Error('Argeportal tab not found');
  return tab.id;
}

async function main() {
  const tabId = await getArgeportalTabId();
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

      setVal('input[name="TCNo"]', '65245305662');
      setVal('input[name="Adi"]', 'ERCÜMENT');
      setVal('input[name="Soyadi"]', 'ERDEN');

      const c1 = dialog.querySelector('#Cinsiyet_Id_1');
      if (c1) { c1.checked = true; $(c1).trigger('change'); }

      setVal('input[name="Email"]', 'ercument.erden@alparai.com');
      
      const pTip = dialog.querySelector('select[name="PersonelTipiTanimi_Id"]');
      if (pTip) { pTip.value = '1'; $(pTip).trigger('change'); }

      setVal('input[name="PersonelGorevUnvani"]', 'Kurucu & Baş Sistem Mimarı');

      const calismaTip = dialog.querySelector('select[name="PersonelCalismaTipiTanimi_Id"]');
      if (calismaTip) { calismaTip.value = '1'; $(calismaTip).trigger('change'); }

      setVal('input[name="DogumYeri"]', 'Ereğli');
      setVal('input[name="DogumTarihi"]', '11.08.1984');
      setVal('input[name="BaslangicTarihi"]', '01.01.2026');

      // Education fields
      const ogrenimSel = dialog.querySelector('#OgrenimDurum_Id');
      if (ogrenimSel) { ogrenimSel.value = '23'; $(ogrenimSel).trigger('change'); }

      const okulSel = dialog.querySelector('#OkulTanimi_Id');
      if (okulSel) { okulSel.value = '110'; $(okulSel).trigger('change'); }

      const bolumSel = dialog.querySelector('#BolumTanimi_Id');
      if (bolumSel) { bolumSel.value = '3'; $(bolumSel).trigger('change'); }

      const mezunSel = dialog.querySelector('#MezuniyetDurumu_Id');
      if (mezunSel) { mezunSel.value = '1'; $(mezunSel).trigger('change'); }

      setVal('input[name="EgitimBaslangicTarihi"]', '15.09.2003');
      setVal('input[name="EgitimBitisTarihi"]', '20.06.2007');

      setVal('textarea[name="YsPersonelOzgecmis"]', '10+ yıl FinTech, Yapay Zeka Sistem Mimarisi, Dağıtık Sistemler, Kriptoloji, Zero-Knowledge Proofs (ZKP) ve Yüksek Başarımlı Bilişim alanlarında Ar-Ge tecrübesi; AlparAI platformunun kurucusu ve baş sistem mimarı.');

      // Remove error classes
      dialog.querySelectorAll('.error').forEach(e => $(e).removeClass('error'));

      const btn = dialog.querySelector('.saveButton');
      if (btn) btn.click();

      return { submitted: true };
    })()`,
    returnByValue: true
  });

  console.log('Submission result Card 11 Full:', JSON.stringify(res.result.value, null, 2));

  // Wait 4 seconds
  await new Promise(r => setTimeout(r, 4000));

  const after = await send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('.badge')).map(b => b.innerText.trim());
      const card11 = document.getElementById('11');
      const card11Check = card11 ? !!card11.querySelector('.fa-check, .fa-check-circle, .badge-success, .green') : false;
      const alerts = Array.from(document.querySelectorAll('.alert, .gritter-item, .ui-state-error')).map(a => a.innerText.trim());
      return { badges, card11Check, alerts };
    })()`,
    returnByValue: true
  });

  console.log('After Card 11 Save:', JSON.stringify(after.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
