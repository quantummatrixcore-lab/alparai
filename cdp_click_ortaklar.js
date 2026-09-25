const ws = new WebSocket('ws://localhost:9222/devtools/page/8C34C588B50D195581944F2FDE361EF6');

let msgId = 1;
function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = msgId++;
        const listener = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === id) {
                ws.removeEventListener('message', listener);
                if (data.error) reject(data.error);
                else resolve(data.result);
            }
        };
        ws.addEventListener('message', listener);
        ws.send(JSON.stringify({ id, method, params }));
        setTimeout(() => reject(new Error('Timeout ' + method)), 5000);
    });
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        await sendCommand('Runtime.evaluate', {
            expression: `
                const target = Array.from(document.querySelectorAll('a')).find(el => el.innerText && el.innerText.trim() === 'Ortaklara Ait Bilgiler');
                if (target) target.click();
            `
        });
        
        await delay(3000); // AJAX wait
        
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea')).map(el => ({
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    text: el.innerText || el.textContent
                })).filter(el => el.id || el.name);
            `,
            returnByValue: true
        });
        console.log("ARGEPORTAL ORTAKLAR:", JSON.stringify(result.result.value, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
