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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        // 1. Click "İletişim Bilgileri"
        await sendCommand('Runtime.evaluate', {
            expression: `
                const links = Array.from(document.querySelectorAll('a'));
                const target = links.find(el => el.innerText && el.innerText.trim() === 'İletişim Bilgileri');
                if (target) {
                    target.click();
                    'Clicked';
                } else {
                    'Not found';
                }
            `,
            returnByValue: true
        });

        // 2. Wait for the form to render (if it's loaded via Ajax or toggled)
        await delay(1500);

        // 3. Dump the inputs in the active panel (or all inputs)
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea, button')).map(el => ({
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
