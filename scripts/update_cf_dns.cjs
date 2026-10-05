const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/8474BAEAF7E6F5EA2D9D59A9DE8101CE');

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
        
        console.log("Updating Cloudflare DNS records to VDS...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let zoneId = "635ead830bc3a409e643b59e3768e9f5"; // wait, zoneId is different! Let me fetch it again!
                    let r = await fetch('/api/v4/zones?name=alparai.com');
                    let json = await r.json();
                    zoneId = json.result[0].id;

                    // Update alparai.com
                    let r1 = await fetch('/api/v4/zones/' + zoneId + '/dns_records/a15129b661cac5abb9ab42ab37f9c148', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'A',
                            name: 'alparai.com',
                            content: '45.143.4.92',
                            proxied: true,
                            ttl: 1
                        })
                    });
                    
                    // Update www.alparai.com
                    let r2 = await fetch('/api/v4/zones/' + zoneId + '/dns_records/93460d2d9eb0046dd7c51afe00dafa35', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'A',
                            name: 'www.alparai.com',
                            content: '45.143.4.92',
                            proxied: true,
                            ttl: 1
                        })
                    });
                    
                    return {
                        r1: await r1.json(),
                        r2: await r2.json()
                    };
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
