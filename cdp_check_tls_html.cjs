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
  const html = await evalJs(`
    (function() {
      // Find heading TLS Delivery Enforcement
      const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, b')).find(el => el.innerText && el.innerText.trim() === 'TLS Delivery Enforcement');
      if (!h) return { error: 'heading not found' };
      let parent = h.parentElement;
      return {
        headingTag: h.tagName,
        parentHtml: parent.innerHTML
      };
    })()
  `);
  console.log('TLS SECTION HTML:');
  console.log(html?.parentHtml);
  ws.close();
});
