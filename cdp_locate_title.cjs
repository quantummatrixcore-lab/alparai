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

        const locateScript = `
            (() => {
                let found = [];
                // Check main document
                const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                let n;
                while(n = walk.nextNode()) {
                    if(n.nodeValue.includes('Kitle Kaynaklı')) {
                        found.push({ tag: n.parentElement.tagName, html: n.parentElement.outerHTML.substring(0, 150) });
                    }
                }
                
                // Check iframes
                const iframes = document.querySelectorAll('iframe');
                for (let i = 0; i < iframes.length; i++) {
                    try {
                        const iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                        const w2 = iframeDoc.createTreeWalker(iframeDoc.body, NodeFilter.SHOW_TEXT, null, false);
                        let n2;
                        while(n2 = w2.nextNode()) {
                            if(n2.nodeValue.includes('Kitle Kaynaklı')) {
                                found.push({ iframe: i, tag: n2.parentElement.tagName, html: n2.parentElement.outerHTML.substring(0, 150) });
                            }
                        }
                    } catch(e) {}
                }
                return found;
            })();
        `;

        let step4 = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: locateScript,
            returnByValue: true
        });

        console.log(JSON.stringify(step4.result.value, null, 2));
    } catch (err) {}
}

run();
