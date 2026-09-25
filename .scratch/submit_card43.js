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

  // Enable console and network tracking
  await send('Console.enable');

  const setRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('.ui-dialog:not([style*="display: none"])');
      if (!dialog) return { error: 'No dialog' };
      const sel = dialog.querySelector('#OfisTipi');
      if (!sel) return { error: 'No OfisTipi select' };
      
      // Set value to 6 (Paylaşımlı Masa (Kuluçka))
      sel.value = '6';
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === '6') {
          sel.selectedIndex = i;
          sel.options[i].selected = true;
        } else {
          sel.options[i].selected = false;
        }
      }
      $(sel).trigger('change');
      
      const btn = dialog.querySelector('.saveButton');
      const form = dialog.querySelector('form');
      
      return {
        ofisTipiVal: sel.value,
        serialized: form ? $(form).serialize() : null,
        btnExists: !!btn,
        formAction: form ? form.action : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Before Save:', JSON.stringify(setRes.result.value, null, 2));

  // Click the save button
  console.log('Triggering click on save button...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('.ui-dialog:not([style*="display: none"])');
      const btn = dialog ? dialog.querySelector('.saveButton') : null;
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });

  console.log('Click result:', clickRes.result.value);

  // Wait 3 seconds for AJAX and DOM update
  await new Promise(r => setTimeout(r, 3000));

  const afterRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('.badge')).map(b => b.innerText.trim());
      const card43 = document.querySelector('[id="43"]');
      const card43Icon = card43 ? card43.querySelector('i')?.className : '';
      const dialogStillOpen = !!document.querySelector('.ui-dialog:not([style*="display: none"])');
      const gritter = Array.from(document.querySelectorAll('.gritter-item, .alert, .message-error, .message-success')).map(g => g.innerText.trim());
      return { badges, card43Icon, dialogStillOpen, gritter };
    })()`,
    returnByValue: true
  });

  console.log('After Save:', JSON.stringify(afterRes.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
