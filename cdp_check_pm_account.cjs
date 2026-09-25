const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/6C7E134411C702CD8A8774FDA1FC8290');

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
  const formInfo = await evalJs(`
    (function() {
      const selects = Array.from(document.querySelectorAll('select'));
      // Find the select for sending mail
      // Check surrounding text
      const info = selects.map((s, idx) => ({
        idx,
        val: s.value,
        parentText: s.parentElement.parentElement.innerText
      }));

      const saveBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Save'));
      return {
        info,
        saveBtns: saveBtns.map(b => ({ text: b.innerText, onclick: b.getAttribute('onclick'), type: b.type }))
      };
    })()
  `);
  console.log('FORM INFO:', JSON.stringify(formInfo, null, 2));

  ws.close();
});
