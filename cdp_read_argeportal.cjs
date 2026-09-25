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
        const targetTab = targets.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
        
        if (!targetTab) {
            console.log(JSON.stringify({ error: 'Argeportal sekmesi bulunamadi. Lutfen tarayicida Argeportal i acik tutun.' }));
            return;
        }

        const jsCode = `
            (() => {
                try {
                    const inputs = Array.from(document.querySelectorAll('textarea, input[type="text"]'))
                        .map(el => {
                            let label = '';
                            if (el.id) {
                                const l = document.querySelector('label[for="' + el.id + '"]');
                                if (l) label = l.innerText;
                            }
                            return { 
                                field: (label || el.name || el.id || 'Unknown_Field').trim(), 
                                value: el.value.trim() 
                            };
                        }).filter(item => item.value !== '');
                    
                    return {
                        url: document.location.href,
                        title: document.title,
                        inputs: inputs,
                        bodyPreview: document.body.innerText.substring(0, 4000)
                    };
                } catch(e) {
                    return { error: e.toString() };
                }
            })();
        `;

        const result = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: jsCode,
            returnByValue: true
        });

        console.log(JSON.stringify(result.result.value, null, 2));

    } catch (err) {
        console.error(JSON.stringify({ error: err.toString() }));
    }
}

run();
