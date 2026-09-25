const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('inbox.purelymail.com')) || tabs.find(t => t.id === '90501D98450E2FA5FF4DD35CF49BDA11');
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

      const info = await evalJs(`
        (function() {
          const inputs = Array.from(document.querySelectorAll('input, select, button'));
          return inputs.map(i => ({
            tag: i.tagName,
            type: i.type,
            name: i.name,
            id: i.id,
            value: i.value,
            checked: i.checked,
            text: i.innerText
          }));
        })()
      `);

      console.log('Mailview settings elements:', JSON.stringify(info, null, 2));

      // Also check Prefer HTML option: _prefer_html
      const htmlOpt = await evalJs(`
        (function() {
          const preferHtml = document.querySelector('input[name="_prefer_html"]');
          const showHtml = document.querySelector('input[name="_show_images"]');
          return {
            preferHtmlChecked: preferHtml ? preferHtml.checked : 'not_found',
            showImagesVal: showHtml ? showHtml.value : 'not_found'
          };
        })()
      `);

      console.log('Prefer HTML info:', htmlOpt);

      ws.close();
      process.exit(0);
    });
  });
});
