const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/382902FAC08962E2FA9B316F23FAA8E0');

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
  const bodyText = await evalJs(`
    (function() {
      // Check textarea or tinymce or contenteditable
      const txt = document.querySelector('textarea#_message, #composebody');
      let content = txt ? txt.value : '';
      const iframe = document.querySelector('iframe#_message_ifr, #composebody_ifr');
      if (iframe) {
        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        content = idoc.body.innerText;
      }
      return content;
    })()
  `);
  console.log('=== COMPOSER BODY TEXT ===');
  console.log(bodyText);
  ws.close();
});
