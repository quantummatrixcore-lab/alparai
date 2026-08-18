const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const tabs = JSON.parse(data);
        const grokTab = tabs.find(t => t.url.includes('grok.com'));
        if (!grokTab) {
            console.error("Grok sekmesi bulunamadı!");
            process.exit(1);
        }

        const ws = new WebSocket(grokTab.webSocketDebuggerUrl);
        ws.on('open', async () => {
            let id = 1;

            const sendCommand = (method, params = {}) => {
                return new Promise((resolve) => {
                    const messageId = id++;
                    const listener = (msg) => {
                        const parsed = JSON.parse(msg);
                        if (parsed.id === messageId) {
                            ws.off('message', listener);
                            resolve(parsed.result);
                        }
                    };
                    ws.on('message', listener);
                    ws.send(JSON.stringify({ id: messageId, method, params }));
                });
            };

            const result = await sendCommand('Runtime.evaluate', {
                expression: `
                    (() => {
                        // Extract text from grok chat
                        const messageElements = document.querySelectorAll('.message-row, [data-message-author-role], .prose, .response-container');
                        if (messageElements.length > 0) {
                            return Array.from(messageElements).map(el => el.innerText).join('\\n\\n---MESSAGE BOUNDARY---\\n\\n');
                        }
                        return document.body.innerText;
                    })()
                `
            });

            const content = result.result ? result.result.value : 'Sonuç okunamadı';
            fs.writeFileSync('C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\GROK_RESPONSE_RAW.txt', content, 'utf8');
            console.log("Grok yanıtı başarıyla kaydedildi. Uzunluk:", content.length);

            ws.close();
            process.exit(0);
        });
    });
});
