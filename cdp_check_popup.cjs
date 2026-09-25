const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A8FA07C04BF0F503810BCA66F619528B');

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
  console.log('Clicking "Yine de görüntülensin" inside iframe...');
  const res = await evalJs(`
    (function() {
      const iframe = document.querySelector('iframe');
      if (!iframe) return { error: 'no iframe' };
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const btn = doc.querySelector('a, button');
      if (btn) {
        btn.click();
        return { success: true };
      }
      return { error: 'no button' };
    })()
  `);
  console.log('Click result:', res);

  await new Promise(r => setTimeout(r, 3000));

  const afterState = await evalJs(`
    (function() {
      const iframe = document.querySelector('iframe');
      if (!iframe) return { error: 'no iframe' };
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      return {
        src: iframe.src,
        text: doc.body.innerText.slice(0, 1000),
        html: doc.body.innerHTML.slice(0, 1000)
      };
    })()
  `);
  console.log('After state:', JSON.stringify(afterState, null, 2));

  ws.close();
});
