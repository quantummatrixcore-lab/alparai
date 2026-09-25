const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/382902FAC08962E2FA9B316F23FAA8E0');
ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        (async function() {
          const lis = Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li'));
          const composeId = rcmail.env.compose_id;
          const results = [];
          for (const li of lis) {
            const fileId = li.id;
            const name = li.innerText.trim().split('\\n')[0];
            try {
              const res = await fetch('/?_task=mail&_file=' + encodeURIComponent(fileId) + '&_id=' + composeId + '&_action=get');
              const buf = await res.arrayBuffer();
              results.push({
                name,
                status: res.status,
                sizeBytes: buf.byteLength,
                healthy: buf.byteLength > 1000
              });
            } catch(e) {
              results.push({ name, error: e.message });
            }
          }
          return results;
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    }
  }));
});
ws.on('message', (m) => {
  const resp = JSON.parse(m);
  if (resp.id === 1) {
    console.table(resp.result?.result?.value);
    ws.close();
  }
});
