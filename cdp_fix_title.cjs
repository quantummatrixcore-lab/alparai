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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    try {
        const targets = await get('http://127.0.0.1:9222/json');
        const targetTab = targets.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
        if (!targetTab) {
            console.log(JSON.stringify({ error: 'Argeportal sekmesi bulunamadi.' }));
            return;
        }

        // 1. "Proje Künyesi" linkini bul ve tikla
        const clickScript = `
            (() => {
                const links = Array.from(document.querySelectorAll('a, button, span, div, li'));
                const kunyeLink = links.find(el => el.innerText && el.innerText.trim() === 'Proje Künyesi');
                if (kunyeLink) {
                    kunyeLink.click();
                    return 'CLICKED_KUNYE';
                }
                
                // Belki href uzerinden bulabiliriz
                const aLinks = Array.from(document.querySelectorAll('a'));
                const hrefLink = aLinks.find(a => a.href && a.href.includes('ProjeKunyesi'));
                if (hrefLink) {
                    hrefLink.click();
                    return 'CLICKED_KUNYE_HREF';
                }
                
                return 'KUNYE_NOT_FOUND';
            })();
        `;
        
        let step1 = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', { expression: clickScript, returnByValue: true });
        console.log('Adim 1:', step1.result.value);
        
        await wait(2500); // Sayfa yuklenmesi icin bekle

        // 2. Basligi bul, degistir ve kaydet
        const updateScript = `
            (() => {
                const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
                let modified = false;
                
                for (let el of inputs) {
                    // Eger mevcut deger eski uzun basligi iceriyorsa
                    if (el.value.includes('Kitle Kaynaklı') || el.value.includes('ALPAR AI:') || el.value.length > 50) {
                        el.value = 'ALPAR AI: Büyük Dil Modelleri İçin Deterministik Karar Güvenliği ve Halüsinasyon Önleme Platformu';
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        modified = true;
                        
                        // Kaydet butonunu bul
                        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn'));
                        const saveBtn = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes('kaydet') || b.innerText.toLowerCase().includes('güncelle')));
                        if (saveBtn) {
                            saveBtn.click();
                            return 'UPDATED_AND_CLICKED_SAVE';
                        }
                        return 'UPDATED_BUT_NO_SAVE_BUTTON_FOUND';
                    }
                }
                
                return 'NOT_FOUND_INPUTS. Ekrandaki inputs: ' + inputs.length;
            })();
        `;

        let step2 = await sendCdpCommand(targetTab.webSocketDebuggerUrl, 'Runtime.evaluate', {
            expression: updateScript,
            returnByValue: true
        });

        console.log('Adim 2:', step2.result.value);

    } catch (err) {
        console.error(err.toString());
    }
}

run();
