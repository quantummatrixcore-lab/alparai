const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const purelyTab = tabs.find(t => t.url && t.url.includes('purelymail.com/manage'));
    if (!purelyTab) {
      console.log('Purelymail tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(purelyTab.webSocketDebuggerUrl);

    function evalJs(code) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 100000);
        const handler = (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            resolve(parsed.result?.result?.value);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
      });
    }

    ws.on('open', async () => {
      console.log('1. Navigating to routing page (https://purelymail.com/manage/routing)...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://purelymail.com/manage/routing' } }));
      await new Promise(r => setTimeout(r, 2500));

      console.log('2. Unchecking Symbolic Subaddressing for alparai.com...');
      const toggleRes = await evalJs(`
        (function() {
          const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
          let unchecked = false;
          checkboxes.forEach(cb => {
            if (cb.checked) {
              cb.click();
              unchecked = true;
            }
          });
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Save'));
          if (saveBtn) {
            saveBtn.click();
            return { unchecked, clickedSave: true };
          }
          return { unchecked, clickedSave: false };
        })()
      `);
      console.log('Toggle result:', toggleRes);

      await new Promise(r => setTimeout(r, 3000));

      console.log('3. Navigating to users page (https://purelymail.com/manage/users)...');
      ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: 'https://purelymail.com/manage/users' } }));
      await new Promise(r => setTimeout(r, 2500));

      console.log('4. Clicking Create new user button...');
      await evalJs(`
        (function() {
          const btns = Array.from(document.querySelectorAll('button, a, div, span'));
          const btn = btns.find(b => b.innerText && b.innerText.trim() === 'Create new user');
          if (btn) btn.click();
        })()
      `);

      await new Promise(r => setTimeout(r, 1500));

      console.log('5. Filling form for ercument.erden@alparai.com...');
      const fillRes = await evalJs(`
        (function() {
          const nameInput = document.querySelector('input[name="name"]');
          const domainSelect = document.querySelector('select[name="domainId"]');
          const passInputs = Array.from(document.querySelectorAll('input[type="password"], input[name*="pass"]'));

          if (nameInput && domainSelect) {
            nameInput.value = 'ercument.erden';
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));

            domainSelect.value = '154522'; // alparai.com
            domainSelect.dispatchEvent(new Event('change', { bubbles: true }));

            passInputs.forEach(p => {
              p.value = '';
              p.dispatchEvent(new Event('input', { bubbles: true }));
              p.dispatchEvent(new Event('change', { bubbles: true }));
            });

            return { nameVal: nameInput.value, domainVal: domainSelect.value };
          }
          return null;
        })()
      `);
      console.log('Fill result:', fillRes);

      await new Promise(r => setTimeout(r, 2000));

      console.log('6. Saving new user...');
      const saveRes = await evalJs(`
        (function() {
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Save') || document.querySelector('button[type="submit"]');
          if (saveBtn) {
            saveBtn.click();
            return 'clicked_save';
          }
          return 'btn_not_found';
        })()
      `);

      console.log('Save result:', saveRes);

      await new Promise(r => setTimeout(r, 3500));

      const finalBodyText = await evalJs('document.body.innerText');
      console.log('=== USERS PAGE AFTER CREATION ===');
      console.log(finalBodyText.slice(0, 2000));

      ws.close();
      process.exit(0);
    });
  });
});
