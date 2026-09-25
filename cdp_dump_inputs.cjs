const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function sendCdpCommand(wsUrl, method, params) {
    const WebSocket = require('ws');
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.on('open', () => ws.send(JSON.stringify({ id: 1, method, params })));
        ws.on('message', (data) => {
            const response = JSON.parse(data);
            if (response.id === 1) {
                ws.close();
                resolve(response.result);
            }
        });
        ws.on('error', reject);
    });
}

async function run() {
    try {
        const targets = await get('http://127.0.0.1:9222/json');
        const targetTab = targets.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
        if (!targetTab) return;

        const dumpScript = `
            (() => {
                const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
                return inputs.map(el => ({
                    id: el.id, 
                    name: el.name, 
                    value: el.value,
                    label: el.closest('.form-group') ? el.closest('.form-group').innerText.split('\\n')[0] : ''
                }));
            })();
        `;

        let step3 = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: dumpScript,
            returnByValue: true
        });

        console.log(JSON.stringify(step3.result.value, null, 2));
    } catch (err) {}
}

run();
