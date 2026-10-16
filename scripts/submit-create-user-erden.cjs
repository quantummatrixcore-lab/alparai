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
      console.log('Filling form to create ercument.erden@alparai.com...');
      
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

            return {
              nameVal: nameInput.value,
              domainVal: domainSelect.value,
              passCount: passInputs.length
            };
          }
          return null;
        })()
      `);

      console.log('Fill result:', fillRes);

      await new Promise(r => setTimeout(r, 2000));

      console.log('Submitting Save button...');
      const submitRes = await evalJs(`
        (function() {
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Save') || document.querySelector('button[type="submit"]');
          if (saveBtn) {
            saveBtn.click();
            return 'clicked_save';
          }
          const form = document.querySelector('form');
          if (form) {
            form.submit();
            return 'submitted_form';
          }
          return 'btn_not_found';
        })()
      `);

      console.log('Submit result:', submitRes);

      await new Promise(r => setTimeout(r, 3000));

      const resultText = await evalJs('document.body.innerText');
      console.log('=== PAGE TEXT AFTER USER CREATION ===');
      console.log(resultText.slice(0, 2000));

      ws.close();
      process.exit(0);
    });
  });
});
