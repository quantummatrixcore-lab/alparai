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

const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
    try {
        console.log('[QUANTUM AGENT] Baslatiliyor...');
        const targets = await get('http://127.0.0.1:9222/json');
        const targetTab = targets.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
        
        if (!targetTab) {
            console.log('[QUANTUM AGENT] HATA: Argeportal sekmesi bulunamadi.');
            return;
        }

        const wsUrl = targetTab.webSocketDebuggerUrl;

        // ADIM 1: GÖZLEM (OBSERVE) VE MENÜYE TIKLAMA
        console.log('[QUANTUM AGENT] Adim 1: Sol menudeki "Proje" veya "Proje Bilgileri" sekmesi araniyor...');
        const navScript = `
            (() => {
                const links = Array.from(document.querySelectorAll('a, li, span, div.menu-item'));
                // Sol menudeki Proje linkini bulalim
                const projeLink = links.find(el => el.innerText && (el.innerText.trim() === 'PROJE' || el.innerText.trim() === 'Proje Bilgileri'));
                
                if (projeLink) {
                    projeLink.click();
                    return 'CLICKED_MENU: ' + projeLink.innerText.trim();
                }
                
                // Eger ana sayfada dogrudan Proje Bilgileri linki varsa
                const cardLink = Array.from(document.querySelectorAll('a')).find(a => a.innerText && a.innerText.includes('Proje Bilgileri'));
                if (cardLink) {
                    cardLink.click();
                    return 'CLICKED_CARD_LINK';
                }
                
                return 'NOT_FOUND_MENU';
            })();
        `;
        
        let navResult = await sendCdpCommand(wsUrl, 'Runtime.evaluate', { expression: navScript, returnByValue: true });
        console.log('[QUANTUM AGENT] Menu Navigasyonu:', navResult.result.value);

        // Bekleme - SPA Yüklemesi veya Sayfa Geçişi
        await wait(3000);
        
        // Eger alt menu acildiysa "Proje Künyesi"ni bulup tiklayalim
        console.log('[QUANTUM AGENT] Adim 2: Proje Künyesi form ekrani araniyor...');
        const subMenuScript = `
            (() => {
                const links = Array.from(document.querySelectorAll('a, button, span'));
                const kunye = links.find(el => el.innerText && el.innerText.trim() === 'Proje Künyesi');
                if (kunye) {
                    kunye.click();
                    return 'CLICKED_SUBMENU_KUNYE';
                }
                return 'NO_SUBMENU_NEEDED_OR_FOUND';
            })();
        `;
        let subNavResult = await sendCdpCommand(wsUrl, 'Runtime.evaluate', { expression: subMenuScript, returnByValue: true });
        console.log('[QUANTUM AGENT] Alt Menu Navigasyonu:', subNavResult.result.value);

        await wait(3000);

        // ADIM 3: İNSANSI FORM DOLDURMA (humanFillForm) VE KAYDET
        console.log('[QUANTUM AGENT] Adim 3: Hedef input araniyor ve B2B basligi ile degistiriliyor...');
        const fillScript = `
            (() => {
                const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
                
                for (let el of inputs) {
                    if (el.value.includes('ALPAR AI:') || el.value.includes('Kitle Kaynaklı') || el.value.length > 30) {
                        el.value = 'ALPAR AI: Büyük Dil Modelleri İçin Deterministik Karar Güvenliği ve Halüsinasyon Önleme Platformu';
                        
                        // İnsansı Olay Tetikleyicileri
                        el.dispatchEvent(new Event('focus', { bubbles: true }));
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('blur', { bubbles: true }));
                        
                        // Kaydet Butonunu Bul (humanClick)
                        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn, a.button'));
                        const saveBtn = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes('kaydet') || b.innerText.toLowerCase().includes('ilerle') || b.innerText.toLowerCase().includes('güncelle')));
                        
                        if (saveBtn) {
                            setTimeout(() => saveBtn.click(), 500); // 500ms delay for natural click
                            return 'B2B_TITLE_UPDATED_AND_SAVED';
                        }
                        
                        return 'B2B_TITLE_UPDATED_BUT_SAVE_BTN_NOT_FOUND';
                    }
                }
                
                return 'FAILED_TO_FIND_TITLE_INPUT. Found inputs on screen: ' + inputs.length;
            })();
        `;
        
        let fillResult = await sendCdpCommand(wsUrl, 'Runtime.evaluate', { expression: fillScript, returnByValue: true });
        console.log('[QUANTUM AGENT] Form Operasyonu:', fillResult.result.value);
        console.log('[QUANTUM AGENT] Operasyon Tamamlandi.');

    } catch (err) {
        console.error('[QUANTUM AGENT] Hata:', err.toString());
    }
}

run();
