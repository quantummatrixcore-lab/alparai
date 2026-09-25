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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        await sendCommand('Runtime.evaluate', {
            expression: `
                function fillField(selector, value, isSelect = false) {
                    const el = document.querySelector(selector);
                    if (el) {
                        if (isSelect) {
                            // Find option by text
                            const options = Array.from(el.options);
                            const opt = options.find(o => o.text.trim() === value);
                            if (opt) {
                                el.value = opt.value;
                            }
                        } else {
                            el.value = value;
                        }
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                
                fillField('#FirmaTelefon1', '+90 850 123 4567');
                fillField('#FirmaEmail', 'ercument.erden@alparai.com');
                fillField('#Websitesi', 'https://alparai.com');
                
                fillField('#AdresTurTanimi_Id', 'Teknopark', true);
                fillField('input[name="string_SehirTanimi_Id"]', 'İstanbul');
                fillField('input[name="string_IlceTanimi_Id"]', 'Pendik');
                fillField('#Adres', 'Teknopark İstanbul, Cube Incubation, Pendik, İstanbul');

                // Kaydet butonunu bul ve tıkla
                const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn'));
                const saveBtn = buttons.find(b => {
                    const txt = b.innerText || b.value || '';
                    return txt.toLowerCase().includes('kaydet') && !txt.toLowerCase().includes('gönder');
                });
                
                if (saveBtn) {
                    saveBtn.click();
                    'Filled and Clicked Save';
                } else {
                    'Filled but Save Button Not Found';
                }
            `,
            returnByValue: true
        }).then(res => console.log('Result:', res.result.value));

    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
