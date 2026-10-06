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
                    let rZones = await fetch('/api/v4/zones?name=alparai.com');
                    let jsonZones = await rZones.json();
                    if (!jsonZones.result || jsonZones.result.length === 0) return JSON.stringify(jsonZones);
                    const zoneId = jsonZones.result[0].id;
                    const r = await fetch('/api/v4/zones/' + zoneId + '/dns_records');
                    const json = await r.json();
                    return JSON.stringify(json);
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(res.result.value);
        ws.close();
    } catch(e) { console.error(e); ws.close(); }
});
