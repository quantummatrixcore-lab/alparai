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

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('button, a')).map(el => {
                    return {
                        tag: el.tagName,
                        ariaLabel: el.getAttribute('aria-label') || '',
                        text: (el.innerText || '').substring(0, 40).replace(/\\n/g, ' ')
                    };
                }).filter(b => b.ariaLabel || b.text).slice(0, 50);
            `,
            returnByValue: true
        });
        console.log("LINKEDIN:", JSON.stringify(result.result.value, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
