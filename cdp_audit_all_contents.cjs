const http = require('http');
const fs = require('fs');
const path = require('path');

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
    const auditReport = {
        timestamp: new Date().toISOString(),
        argeportal: {},
        webmail: {},
        localFiles: []
    };

    try {
        const targets = await get('http://127.0.0.1:9222/json');

        // 1. ARGEPORTAL DENETİMİ
        const apTab = targets.find(t => t.url.includes('argeportal.teknoparkistanbul.com.tr'));
        if (apTab) {
            const apScript = `
                (() => {
                    const text = document.body.innerText;
                    return {
                        url: document.location.href,
                        title: document.title,
                        is16of16: text.includes('16 / 16'),
                        is10of10: text.includes('10 / 10'),
                        is1of1: text.includes('1 / 1'),
                        hasNewTitle: text.includes('Büyük Dil Modelleri İçin Deterministik Karar Güvenliği'),
                        hasOldTitle: text.includes('Kitle Kaynaklı'),
                        bodySnippet: text.substring(0, 1500)
                    };
                })();
            `;
            const apRes = await sendCdpCommand(apTab.webSocketDebuggerUrl, 'Runtime.evaluate', { expression: apScript, returnByValue: true });
            auditReport.argeportal = apRes.result.value;
        } else {
            auditReport.argeportal = { error: 'Argeportal sekmesi bulunamadı' };
        }

        // 2. PURELYMAIL WEBMAIL DENETİMİ
        const pmTab = targets.find(t => t.url.includes('purelymail.com') && t.url.includes('_task=mail') && t.url.includes('_action=compose'));
        if (pmTab) {
            const pmScript = `
                (() => {
                    const to = document.getElementById('_to')?.value || '';
                    const cc = document.getElementById('_cc')?.value || '';
                    const subject = document.getElementById('_subject')?.value || '';
                    const message = document.getElementById('_message')?.value || '';
                    
                    const attachNodes = Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li, #compose-attachments li'));
                    const attachments = attachNodes.map(li => {
                        const nameEl = li.querySelector('.name, .filename, a');
                        const sizeEl = li.querySelector('.size');
                        return {
                            raw: li.innerText.replace(/\\s+/g, ' ').trim(),
                            name: nameEl ? nameEl.innerText.trim() : li.innerText.trim(),
                            size: sizeEl ? sizeEl.innerText.trim() : ''
                        };
                    });

                    return {
                        to,
                        cc,
                        subject,
                        bodyLength: message.length,
                        bodyPreview: message.substring(0, 500),
                        hasTCKN: /\\b[1-9][0-9]{10}\\b/.test(message),
                        hasAddress: message.includes('Mutluluk') || message.includes('Avcılar') || message.includes('Mustafa Kemalpaşa'),
                        hasISKI: message.includes('İSKİ') || message.includes('ISKI'),
                        hasFrascati: message.includes('Frascati'),
                        attachmentCount: attachments.length,
                        attachments: attachments
                    };
                })();
            `;
            const pmRes = await sendCdpCommand(pmTab.webSocketDebuggerUrl, 'Runtime.evaluate', { expression: pmScript, returnByValue: true });
            auditReport.webmail = pmRes.result.value;
        } else {
            auditReport.webmail = { error: 'Purelymail compose sekmesi bulunamadı' };
        }

        // 3. YEREL DOSYALAR DENETİMİ
        const localDir = 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari';
        if (fs.existsSync(localDir)) {
            const files = fs.readdirSync(localDir);
            for (const f of files) {
                const fullPath = path.join(localDir, f);
                const stat = fs.statSync(fullPath);
                if (stat.isFile()) {
                    auditReport.localFiles.push({
                        name: f,
                        sizeBytes: stat.size,
                        sizeKB: Math.round(stat.size / 1024)
                    });
                }
            }
        }

        console.log(JSON.stringify(auditReport, null, 2));

    } catch (err) {
        console.error('Audit Hatası:', err.toString());
    }
}

run();
