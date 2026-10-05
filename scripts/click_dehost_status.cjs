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
        await send('Runtime.enable');
        console.log("Evaluating page...");
        const res = await send('Runtime.evaluate', {
            expression: `
                (async () => {
                    let buttons = Array.from(document.querySelectorAll('a, button'));
                    let statuses = Array.from(document.querySelectorAll('div, span, p')).filter(e => e.innerText && e.innerText.includes('Durum'));
                    let relevantButtons = buttons.map(b => b.innerText.trim()).filter(t => t.toLowerCase().includes('başlat') || t.toLowerCase().includes('durdur') || t.toLowerCase().includes('aç') || t.toLowerCase().includes('kapat') || t.toLowerCase().includes('reboot') || t.toLowerCase().includes('start') || t.toLowerCase().includes('onayla') || t.toLowerCase().includes('evet'));
                    
                    // Look for a modal or confirmation button
                    let confirmBtn = buttons.find(b => b.innerText.toLowerCase().trim() === 'evet' || b.innerText.toLowerCase().trim() === 'onayla' || b.innerText.toLowerCase().trim() === 'tamam');
                    if (confirmBtn && confirmBtn.offsetParent !== null) { // if visible
                        confirmBtn.click();
                        return "Clicked confirmation modal button: " + confirmBtn.innerText;
                    }
                    
                    let startBtn = buttons.find(b => b.innerText.toLowerCase().trim() === 'başlat' || b.innerText.toLowerCase().trim() === 'start');
                    if (startBtn && startBtn.offsetParent !== null) {
                        startBtn.click();
                        return "Clicked START (Başlat) button instead of Restart.";
                    }

                    return { buttons: relevantButtons, bodyText: document.body.innerText.substring(0, 1000) };
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
