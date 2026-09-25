const http = require('http');
const fs = require('fs');

const EMAIL_TEXT_PATH = 'D:\\\\AlparAi\\\\Teknopark_Istanbul_Basvuru_Evraklari\\\\06_RESMI_YANIT_EPOSTASI_METNI.md';

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
        ws.on('open', () => {
            ws.send(JSON.stringify({ id: 1, method, params }));
        });
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
        const pmTab = targets.find(t => t.url.includes('purelymail.com') && t.url.includes('_task=mail') && t.url.includes('_action=compose'));
        
        if (!pmTab) {
            console.log('Purelymail compose tab not found.');
            return;
        }

        const emailContent = fs.readFileSync(EMAIL_TEXT_PATH, 'utf8');
        const safeContent = emailContent.replace(/`/g, '\\\\`').replace(/\\$/g, '\\\\$');

        const jsCode = `
            const msgBox = document.getElementById('_message');
            if (msgBox) {
                msgBox.value = \`${safeContent}\`;
                msgBox.dispatchEvent(new Event('input', { bubbles: true }));
                msgBox.dispatchEvent(new Event('change', { bubbles: true }));
                'INJECTED_SUCCESSFULLY';
            } else {
                'MESSAGE_BOX_NOT_FOUND';
            }
        `;

        const result = await sendCdpCommand(pmTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: jsCode,
            returnByValue: true
        });

        console.log('Injection Result:', result.result.value);
        console.log('GOREV BASARILI: E-posta metni enjekte edildi. GONDER BUTONUNA BASILMADI.');

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
