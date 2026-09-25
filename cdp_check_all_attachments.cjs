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
  const allTests = await evalJs(`
    (async function() {
      const lis = Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li'));
      const results = [];
      for (const li of lis) {
        const fileId = li.id;
        const name = li.querySelector('.attachment-name, .name, a')?.innerText?.trim();
        try {
          const res = await fetch('/?_task=mail&_file=' + encodeURIComponent(fileId) + '&_id=3815376906aaaff32458d0&_action=get');
          const buf = await res.arrayBuffer();
          results.push({
            id: fileId,
            name,
            status: res.status,
            size: buf.byteLength,
            empty: buf.byteLength === 0
          });
        } catch (e) {
          results.push({ id: fileId, name, error: e.message });
        }
      }
      return results;
    })()
  `);
  console.log('ALL ATTACHMENTS HEALTH CHECK:');
  console.table(allTests);
  ws.close();
});
