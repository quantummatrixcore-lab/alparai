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
        setTimeout(() => reject(new Error('Timeout ' + method)), 5000);
    });
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        const result = await sendCommand('Runtime.evaluate', {
            expression: `
                const dataMap = {
                    'ortak': 'Ercüment ERDEN',
                    'ad': 'Ercüment',
                    'soyad': 'ERDEN',
                    'hisse': '100',
                    'özgeçmiş': '10+ yıl FinTech, İngilizce/Türkçe, Lionexia Ltd. kurucusu',
                    'ozgecmis': '10+ yıl FinTech, İngilizce/Türkçe, Lionexia Ltd. kurucusu',
                    'telefon': '+90 850 123 4567',
                    'email': 'ercument.erden@alparai.com',
                    'eposta': 'ercument.erden@alparai.com',
                    'tc': '11111111111' // Placeholder
                };

                let filledCount = 0;
                const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], textarea'));
                
                for(let el of inputs) {
                    const idName = (el.id + ' ' + el.name).toLowerCase();
                    for(let key in dataMap) {
                        if(idName.includes(key) && !el.value) {
                            el.value = dataMap[key];
                            el.dispatchEvent(new Event('input', {bubbles: true}));
                            el.dispatchEvent(new Event('change', {bubbles: true}));
                            filledCount++;
                            break;
                        }
                    }
                }
                
                const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn'));
                const saveBtn = buttons.reverse().find(b => {
                    const txt = b.innerText || b.value || '';
                    return txt.toLowerCase().includes('kaydet') && !txt.toLowerCase().includes('gönder');
                });
                
                if (saveBtn) {
                    saveBtn.click();
                    'Filled ' + filledCount + ' fields and Clicked Save';
                } else {
                    'Filled ' + filledCount + ' fields but Save Button Not Found';
                }
            `,
            returnByValue: true
        });
        console.log("AUTO-FILL RESULT:", result.result.value);
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
