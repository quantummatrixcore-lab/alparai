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
      const inp = document.querySelector('input[name="string_ProjeYoneticiPersonel_Id"]');
      if (!inp) return { err: 'No inp' };
      
      inp.value = 'ERCÜMENT';
      $(inp).autocomplete('search', 'ERCÜMENT');

      const inp2 = document.querySelector('input[name="string_Personel_Id"]');
      if (inp2) {
        inp2.value = 'ERCÜMENT';
        $(inp2).autocomplete('search', 'ERCÜMENT');
      }

      return { searched: true };
    })()`,
    returnByValue: true
  });

  console.log('Search dispatched:', JSON.stringify(res.result.value, null, 2));

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const menus = Array.from(document.querySelectorAll('.ui-autocomplete:not([style*="display: none"])')).map(m => {
        return Array.from(m.querySelectorAll('li')).map(li => ({
          text: li.innerText.trim(),
          data: $(li).data('item.autocomplete') || $(li).data('ui-autocomplete-item')
        }));
      });
      return { menus };
    })()`,
    returnByValue: true
  });

  console.log('Autocomplete Search Results:', JSON.stringify(listRes.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
