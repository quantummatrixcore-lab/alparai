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
  console.log('Navigating back to https://purelymail.com/manage/welcome...');
  ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'https://purelymail.com/manage/welcome' } }));
  await new Promise(r => setTimeout(r, 2500));

  const links = await evalJs(`
    Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(a => a.text)
  `);
  console.log('=== MANAGE WELCOME LINKS ===');
  console.log(JSON.stringify(links, null, 2));

  ws.close();
});
