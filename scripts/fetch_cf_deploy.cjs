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
        
        console.log("Fetching deployments for alparai-platform-live...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let r = await fetch('/api/v4/accounts/635ead830bc3a409e643b59e3768e9f5/pages/projects/alparai-platform-live/deployments');
                    let json = await r.json();
                    return json.result.map(d => ({
                        id: d.id,
                        env: d.environment,
                        url: d.url,
                        latest_stage: d.latest_stage
                    }));
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
