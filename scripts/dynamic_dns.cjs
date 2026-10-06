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
        console.log("Dynamically switching DNS to VDS (45.143.4.92)...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let rZones = await fetch('/api/v4/zones?name=alparai.com');
                    let jsonZones = await rZones.json();
                    if (!jsonZones.result || jsonZones.result.length === 0) return { error: "Zone not found" };
                    
                    const zoneId = jsonZones.result[0].id;
                    
                    const r = await fetch('/api/v4/zones/' + zoneId + '/dns_records');
                    const json = await r.json();
                    if (!json.result) return { error: "No records found" };
                    
                    const rootRecord = json.result.find(x => x.name === 'alparai.com');
                    const wwwRecord = json.result.find(x => x.name === 'www.alparai.com');
                    
                    const results = [];
                    
                    if (rootRecord) {
                        const rr = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + rootRecord.id, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ type: 'A', name: 'alparai.com', content: '45.143.4.92', proxied: true, ttl: 1 })
                        });
                        results.push(await rr.json());
                    }
                    
                    if (wwwRecord) {
                        const ww = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + wwwRecord.id, {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ type: 'A', name: 'www.alparai.com', content: '45.143.4.92', proxied: true, ttl: 1 })
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
    } catch(e) { console.error(e); ws.close(); }
});
