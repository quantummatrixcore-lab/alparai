const ws = new WebSocket('ws://localhost:9222/devtools/page/A2D0B4CAD72CA5453578044D202FB37A');

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
        setTimeout(() => reject(new Error('Timeout ' + method)), 3000);
    });
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        await sendCommand('Runtime.evaluate', {
            expression: `
                const btn = document.querySelector('a[aria-label="Profili düzenleyin"]');
                if (btn) btn.click();
            `
        });

        await delay(2000); // Wait for modal to open

        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('div[role="dialog"] input, div[role="dialog"] textarea, div[role="dialog"] select')).map(el => ({
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    value: el.value,
                    label: el.previousElementSibling ? el.previousElementSibling.innerText : ''
                })).filter(el => el.id);
            `,
            returnByValue: true
        });
        console.log(JSON.stringify(result.result.value, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
