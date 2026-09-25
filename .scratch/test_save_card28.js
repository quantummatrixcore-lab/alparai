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

  // Clean dialogs and open Card 28
  await send('Runtime.evaluate', {
    expression: `(() => {
      $('.ui-dialog-content').dialog('close');
      $('.ui-dialog').remove();
      $('.ui-widget-overlay').remove();
    })()`
  });

  await new Promise(r => setTimeout(r, 500));

  console.log('Opening Card 28...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const c = document.getElementById('28');
      if (c) c.click();
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

      setVal('input[name="string_ProjeYoneticiPersonel_Id"]', 'ERCÜMENT ERDEN');
      
      // Also look for child form to add to table
      setVal('input[name="string_Personel_Id"]', 'ERCÜMENT ERDEN');
      setVal('input[name="GorevAdi"]', 'Proje Yürütücüsü & Baş Sistem Mimarı');
      setVal('input[name="Efor"]', '100');

      const btn = dialog.querySelector('.saveButton');
      if (btn) btn.click();

      const form = dialog.querySelector('form');
      return {
        submitted: true,
        serialized: form ? $(form).serialize() : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Card 28 submission test:', JSON.stringify(res.result.value, null, 2));

  await new Promise(r => setTimeout(r, 3500));

  const after = await send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('.badge')).map(b => b.innerText.trim());
      const card28 = document.getElementById('28');
      const card28Check = card28 ? !!card28.querySelector('.fa-check, .fa-check-circle, .badge-success, .green') : false;
      const alerts = Array.from(document.querySelectorAll('.alert, .gritter-item, .ui-state-error')).map(a => a.innerText.trim());
      return { badges, card28Check, alerts };
    })()`,
    returnByValue: true
  });

  console.log('After Card 28 Save:', JSON.stringify(after.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
