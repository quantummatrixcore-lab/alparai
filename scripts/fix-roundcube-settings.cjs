const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('inbox.purelymail.com')) || tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
    if (!tab) {
      console.log('Purelymail webmail tab not found');
      process.exit(1);
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

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
      console.log('Navigating to mailview settings...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=settings&_action=edit-prefs&_section=mailview' } }));

      await new Promise(r => setTimeout(r, 2000));

      const updateRes = await evalJs(`
        (function() {
          const charsetSelect = document.querySelector('select[name="_default_charset"]');
          const showImagesSelect = document.querySelector('select[name="_show_images"]');
          const saveBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Kaydet'));

          if (charsetSelect) charsetSelect.value = 'UTF-8';
          if (showImagesSelect) showImagesSelect.value = '3'; // Always

          if (saveBtn) {
            saveBtn.click();
            return { success: true, charset: charsetSelect ? charsetSelect.value : '', showImages: showImagesSelect ? showImagesSelect.value : '' };
          }
          return { success: false };
        })()
      `);

      console.log('Update settings result:', updateRes);

      await new Promise(r => setTimeout(r, 2500));
      ws.close();
      process.exit(0);
    });
  });
});
