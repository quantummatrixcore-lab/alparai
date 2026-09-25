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
ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        await sendCommand('Runtime.evaluate', {
            expression: `
                function fillField(selector, value) {
                    const el = document.querySelector(selector);
                    if (el) {
                        el.value = value;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                function checkField(selector) {
                    const el = document.querySelector(selector);
                    if (el && !el.checked) {
                        el.checked = true;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                
                fillField('#Unvan', 'Founder & Chief Architect');
                fillField('#Adi', 'Ercüment');
                fillField('#Soyadi', 'ERDEN');
                fillField('#Gorevi', 'Kurucu');
                fillField('#YetkiliTelefon1', '+90 850 123 4567');
                fillField('#CepTel', '+90 850 123 4567');
                fillField('#YetkiliEmail', 'ercument.erden@alparai.com');
                
                // Tüm yetkileri ver
                for (let i = 1; i <= 7; i++) {
                    checkField('#YetkiGrubu_Id_' + i);
                }

                // Kaydet butonuna tıkla
                const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn'));
                const saveBtn = buttons.reverse().find(b => {
                    const txt = b.innerText || b.value || '';
                    return txt.toLowerCase().includes('kaydet') && !txt.toLowerCase().includes('gönder');
                });
                
                if (saveBtn) {
                    saveBtn.click();
                    'Yetkili Filled and Clicked Save';
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
