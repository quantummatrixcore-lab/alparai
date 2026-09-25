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
  const downloadTest = await evalJs(`
    fetch('/?_task=mail&_file=rcmfile3815376906aaaff32458d07f5837381502f6fd8076b30a01790842&_id=3815376906aaaff32458d0&_action=get')
      .then(async r => ({
        status: r.status,
        headers: Object.fromEntries(r.headers.entries()),
        size: (await r.arrayBuffer()).byteLength
      }))
      .catch(e => ({ error: e.message }))
  `);
  console.log('DOWNLOAD TEST:', JSON.stringify(downloadTest, null, 2));
  ws.close();
});
