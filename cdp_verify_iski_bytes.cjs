const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/382902FAC08962E2FA9B316F23FAA8E0');
ws.on('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        fetch('/?_task=mail&_file=rcmfile6580394036aad255805a0cd771f29fc5e752fc9e862015a47f4cf0&_id=6580394036aad255805a0c&_action=get')
          .then(async r => ({
            status: r.status,
            contentType: r.headers.get('content-type'),
            byteLength: (await r.arrayBuffer()).byteLength
          }))
      `,
      awaitPromise: true,
      returnByValue: true
    }
  }));
});
ws.on('message', (m) => {
  const resp = JSON.parse(m);
  if (resp.id === 1) {
    console.log('REAL ATTACHMENT FETCH TEST:', resp.result?.result?.value);
    ws.close();
  }
});
