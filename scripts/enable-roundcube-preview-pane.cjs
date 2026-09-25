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
      console.log('Navigating to Roundcube Mailbox View Settings...');
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=settings&_action=edit-prefs&_section=mailbox' } }));

      await new Promise(r => setTimeout(r, 2500));

      console.log('Enabling Preview Pane and Widescreen Layout...');
      const prefRes = await evalJs(`
        (function() {
          const previewPaneCb = document.querySelector('input[name="_preview_pane"]');
          const layoutSelect = document.querySelector('select[name="_layout"]');
          const saveBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button, input[type="submit"]')).find(b => b.innerText && b.innerText.includes('Kaydet'));

          let changed = false;
          if (previewPaneCb && !previewPaneCb.checked) {
            previewPaneCb.click();
            changed = true;
          }
          if (layoutSelect) {
            layoutSelect.value = 'widescreen';
            layoutSelect.dispatchEvent(new Event('change', { bubbles: true }));
            changed = true;
          }

          if (saveBtn) {
            saveBtn.click();
            return { success: true, changed };
          }
          return { success: false, previewPaneCb: !!previewPaneCb, layoutSelect: !!layoutSelect };
        })()
      `);

      console.log('Settings save result:', prefRes);

      await new Promise(r => setTimeout(r, 2500));

      console.log('Navigating back to INBOX list...');
      ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: 'https://inbox.purelymail.com/?_task=mail&_mbox=INBOX' } }));

      await new Promise(r => setTimeout(r, 2500));

      ws.close();
      process.exit(0);
    });
  });
});
