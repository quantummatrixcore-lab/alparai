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
    });
}

const sections = [
    'Makine Teçhizat Bilgileri', 'Yazılım Bilgileri', 'Kiralanacak Alan Bilgileri',
    'Proje Künyesi', 'Proje Hedefleri', 'Proje Nitelikleri', 'Arge Aşamaları', 'Proje Bütçesi',
    'Proje Detayı', 'Proje Ekibi', 'AR-GE Destekleri', 'Ortaklar-Anahtar Kelimeler', 
    'Teknoparktan Talep Edilen Hizmetler', 'Proje Kapsamında Alınacak Yeni Ekipman', 
    'Proje Ekonomik Değeri', 'Projenin Çevreye Etkileri', 'Proje Alınacak Dış Hizmetler', 
    'Projenin Çıktıları', 'Personel Ekle'
];

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        const result = await sendCommand('Runtime.evaluate', {
            expression: `(async () => {
                const dataMap = {
                    'proje adi': 'ALPAR AI — ZKP Destekli Bağımsız Yapay Zeka Denetim, Güvenilirlik ve Hesap Verebilirlik Platformu',
                    'proje kodu': 'ALPAR-AI-2026-TRUST',
                    'kod': 'ALPAR-AI-2026-TRUST',
                    'sure': '12',
                    'ay': '12',
                    'trl': '5',
                    'seviye': '5',
                    'personel': '4 FTE Ar-Ge + 1 yarı zamanlı İTÜ bursiyeri. (Bütçe: 3.000.000 TL)',
                    'istihdam': '4 FTE Ar-Ge + 1 yarı zamanlı İTÜ bursiyeri.',
                    'techizat': '750000',
                    'makine': '750000',
                    'yazilim': '500000',
                    'danismanlik': '500000',
                    'genel': '250000',
                    'iddia': 'ZKP veri egemenliği, Halüsinasyon tespit motoru, 17-vektör adversarial taksonomi',
                    'hedef': 'ZKP veri egemenliği, Halüsinasyon tespit motoru, 17-vektör adversarial taksonomi',
                    'nitelik': 'ZKP veri egemenliği, Halüsinasyon tespit motoru, 17-vektör adversarial taksonomi',
                    'pazar': 'BDDK bankacılık, SSB savunma, DTO kamu',
                    'sektor': 'BDDK bankacılık, SSB savunma, DTO kamu',
                    'fikri': 'AI Audit Score™, TÜRKPATENT patent beyanı',
                    'patent': 'AI Audit Score™, TÜRKPATENT patent beyanı',
                    'alan': 'Masa/kuluçka alanı, ~1-2 masalık (Cube Incubation)',
                    'kira': 'Masa/kuluçka alanı, ~1-2 masalık',
                    'ortak': 'Ercüment ERDEN - 100% Hisse',
                    'ozgecmis': '10+ yıl FinTech, İngilizce/Türkçe, Lionexia Ltd. kurucusu',
                    'ad': 'Ercüment ERDEN',
                    'aciklama': 'ZKP destekli AI denetim süreçleri ve platform geliştirme',
                    'detay': 'ZKP destekli AI denetim süreçleri ve platform geliştirme',
                    'cıktı': 'AI Audit Score™ ve ZKP Güvenilirlik Raporu',
                    'ekonomik': 'Pazar payı büyümesi, ithal ikamesi, yüksek teknoloji ihracatı'
                };

                const sections = ${JSON.stringify(sections)};
                let logs = [];

                for (let section of sections) {
                    const link = Array.from(document.querySelectorAll('a')).find(el => el.innerText && el.innerText.includes(section));
                    if (!link) {
                        logs.push('Section not found: ' + section);
                        continue;
                    }
                    
                    link.click();
                    await new Promise(r => setTimeout(r, 2000)); // wait for AJAX
                    
                    let filled = 0;
                    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea'));
                    
                    for(let el of inputs) {
                        const idName = (el.id + ' ' + el.name).toLowerCase();
                        const labelText = (el.previousElementSibling ? el.previousElementSibling.innerText : '').toLowerCase();
                        const searchText = idName + ' ' + labelText;
                        
                        if(el.value.trim() === '') {
                            for(let key in dataMap) {
                                if(searchText.includes(key)) {
                                    el.value = dataMap[key];
                                    el.dispatchEvent(new Event('input', {bubbles: true}));
                                    el.dispatchEvent(new Event('change', {bubbles: true}));
                                    filled++;
                                    break;
                                }
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
                        logs.push(section + ': Filled ' + filled + ' fields and saved.');
                    } else {
                        logs.push(section + ': Filled ' + filled + ' fields. No save button.');
                    }
                    
                    await new Promise(r => setTimeout(r, 1000)); // wait after save
                }
                
                return logs.join('\\n');
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        
        console.log("ARGEPORTAL BATCH RESULT:\\n", result.result.value);
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
