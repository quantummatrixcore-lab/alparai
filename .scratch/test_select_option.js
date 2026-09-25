async function main() {
  const tabId = 'B3FBF7D71C7F3AFE4B708F673B656C5A';
  await fetch(`http://localhost:9222/json/activate/${tabId}`);
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
      const sel = document.getElementById('OfisTipi');
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === '6') {
          sel.selectedIndex = i;
          sel.options[i].selected = true;
          break;
        } else {
          sel.options[i].selected = false;
        }
      }
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      $(sel).trigger('change');

      const form = sel.closest('form');
      return {
        selVal: sel.value,
        selectedIndex: sel.selectedIndex,
        serialized: $(form).serialize()
      };
    })()`,
    returnByValue: true
  });

  console.log('Dispatch Test:', JSON.stringify(res.result.value, null, 2));

  // Now click save button
  console.log('Clicking saveButton on Card 43...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('.ui-dialog:not([style*="display: none"])');
      const btn = dialog ? dialog.querySelector('.f3.saveButton') : null;
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 3000));

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('.badge')).map(b => b.innerText.trim());
      const card43 = document.querySelector('[id="43"]');
      const icon43 = card43 ? card43.querySelector('i')?.className : '';
      const alerts = Array.from(document.querySelectorAll('.alert, .message-info, .gritter-item')).map(a => a.innerText?.trim());
      return { badges, icon43, alerts };
    })()`,
    returnByValue: true
  });

  console.log('Post-save verification Card 43:', JSON.stringify(check.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
