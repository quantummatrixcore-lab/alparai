const WebSocket = require('ws');
const fs = require('fs');
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
        
        console.log("Fetching zones from Cloudflare dashboard API...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let r = await fetch('/api/v4/zones?name=alparai.com');
                    let json = await r.json();
                    let zoneId = json.result[0].id;
                    
                    let r2 = await fetch('/api/v4/zones/' + zoneId + '/dns_records');
                    let records = await r2.json();
                    
                    return {
                        zoneId: zoneId,
                        records: records.result
                    };
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        
        fs.writeFileSync('scripts/cf_dump.json', JSON.stringify(res.result.value, null, 2));
        console.log("Dumped to scripts/cf_dump.json");

        ws.close();
    } catch(e) {
        console.error(e);
        ws.close();
    }
});
