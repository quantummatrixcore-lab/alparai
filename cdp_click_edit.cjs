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

        const findLinkScript = `
            (() => {
                const h2s = Array.from(document.querySelectorAll('h2'));
                const target = h2s.find(h => h.innerHTML.includes('Kitle Kaynaklı'));
                if (target) {
                    const card = target.closest('.card') || target.closest('div');
                    const links = Array.from(card.querySelectorAll('a'));
                    
                    // Try to find a link that looks like edit or details
                    const editLink = links.find(a => a.href && (a.href.includes('Edit') || a.href.includes('Proje') || a.innerText.includes('Proje Bilgileri')));
                    
                    if (editLink) {
                        editLink.click();
                        return 'CLICKED_LINK: ' + editLink.href;
                    }
                    
                    // If no explicit link, just click the H2 itself or its parent A if exists
                    const parentA = target.closest('a');
                    if (parentA) {
                        parentA.click();
                        return 'CLICKED_H2_PARENT: ' + parentA.href;
                    }

                    return 'FOUND_H2_BUT_NO_CLICKABLE_LINK. HTML: ' + card.innerHTML.substring(0, 300);
                }
                return 'H2_NOT_FOUND';
            })();
        `;

        let step5 = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: findLinkScript,
            returnByValue: true
        });

        console.log(JSON.stringify(step5.result.value, null, 2));
    } catch (err) {}
}

run();
