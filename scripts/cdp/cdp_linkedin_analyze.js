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
        setTimeout(() => reject(new Error('Timeout ' + method)), 4000);
    });
}

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('button, a[role="button"]')).map(el => {
                    const ariaLabel = el.getAttribute('aria-label') || '';
                    return {
                        tag: el.tagName,
                        ariaLabel: ariaLabel,
                        text: (el.innerText || '').substring(0, 30).replace(/\\n/g, ' ')
                    };
                }).filter(b => 
                    b.ariaLabel.includes('Edit') || 
                    b.ariaLabel.includes('Düzenle') || 
                    b.text.includes('Edit') || 
                    b.text.includes('Düzenle')
                );
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
