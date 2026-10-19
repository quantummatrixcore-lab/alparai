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
        setTimeout(() => reject(new Error('Timeout ' + method)), 3000);
    });
}

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
                    tag: el.tagName,
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    value: el.value,
                    text: el.innerText || el.textContent
                })).filter(el => el.id || el.name || el.tag === 'BUTTON');
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

ws.addEventListener('error', (err) => {
    console.error('WebSocket Error:', err);
});
