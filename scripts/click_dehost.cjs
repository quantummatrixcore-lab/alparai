const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/120565F1E4D6DC73EEB2BCB8D5F77678');

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
        
        console.log("Navigating to Sunucularim...");
        await send('Page.navigate', { url: 'https://my.dehost.com.tr/hesabim/urun-ve-hizmetlerim/server' });
        
        await delay(3000); // wait for page load
        
        console.log("Evaluating page...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let links = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('hizmet-detay'));
                    if (links.length > 0) {
                        links[0].click(); // Click the first VDS service
                        return "Clicked VDS details: " + links[0].href;
                    }
                    return "No VDS link found";
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(res.result.value);

        await delay(3000); // wait for details page to load

        console.log("Looking for Restart button...");
        const res2 = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let buttons = Array.from(document.querySelectorAll('a, button'));
                    let restartBtn = buttons.find(b => b.innerText.toLowerCase().includes('yeniden başlat') || b.innerText.toLowerCase().includes('reboot') || b.href?.includes('reboot'));
                    if (restartBtn) {
                        restartBtn.click();
                        return "Clicked Restart button!";
                    }
                    return "No restart button found. Texts: " + buttons.map(b => b.innerText.trim()).filter(x=>x).slice(0, 50).join(', ');
                })();
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(res2.result.value);

        await delay(2000);
        ws.close();
    } catch(e) {
        console.error(e);
        ws.close();
    }
});
