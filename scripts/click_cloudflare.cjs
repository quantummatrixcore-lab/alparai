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

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

ws.on('open', async () => {
    try {
        await send('Page.enable');
        await send('Runtime.enable');
        
        console.log("Navigating to alparai.com DNS in Cloudflare...");
        // Assuming we need to go to the zone. Let's just evaluate first.
        
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    return {
                        url: location.href,
                        title: document.title,
                        links: Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('alparai')).slice(0, 10),
                        bodyText: document.body.innerText.substring(0, 1000)
                    };
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(JSON.stringify(res.result.value, null, 2));

        await delay(2000);
        ws.close();
    } catch(e) {
        console.error(e);
        ws.close();
    }
});
