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
        console.log("Switching DNS to VDS (45.143.4.92) for MAX SPEED...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    const zoneId = '635ead830bc3a409e643b59e3768e9f5';
                    const r = await fetch('/api/v4/zones/' + zoneId + '/dns_records?type=A,CNAME');
                    const json = await r.json();
                    
                    const rootRecord = json.result.find(x => x.name === 'alparai.com');
                    const wwwRecord = json.result.find(x => x.name === 'www.alparai.com');
                    
                    const results = [];
                    
                    if (rootRecord) {
                        const rr = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + rootRecord.id, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                type: 'A',
                                name: 'alparai.com',
                                content: '45.143.4.92',
                                proxied: true
                            })
                        });
                        results.push(await rr.json());
                    }
                    
                    if (wwwRecord) {
                        const ww = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + wwwRecord.id, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                type: 'A',
                                name: 'www.alparai.com',
                                content: '45.143.4.92',
                                proxied: true
                            })
                        });
                        results.push(await ww.json());
                    }
                    
                    return results;
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(JSON.stringify(res.result.value, null, 2));
        ws.close();
    } catch(e) {
        console.error(e);
        ws.close();
    }
});
