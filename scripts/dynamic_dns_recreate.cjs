const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/BE50AF206AA0960FB59905DCEFAAEA2C');

let id = 1;
function send(method, params = {}) {
    return new Promise((resolve) => {
        const messageId = id++;
        const listener = (data) => {
            const parsed = JSON.parse(data);
            if (parsed.id === messageId) {
                ws.removeListener('message', listener);
                resolve(parsed.result);
            }
        };
        ws.on('message', listener);
        ws.send(JSON.stringify({ id: messageId, method, params }));
    });
}

ws.on('open', async () => {
    try {
        await send('Runtime.enable');
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    const r = await fetch('/api/v4/zones/635ead830bc3a409e643b59e3768e9f5/dns_records');
                    return await r.json();
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(JSON.stringify(res.result.value, null, 2));
        ws.close();
    } catch(e) { console.error(e); ws.close(); }
});
