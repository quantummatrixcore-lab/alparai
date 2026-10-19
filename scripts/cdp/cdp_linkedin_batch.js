const ws = new WebSocket('ws://localhost:9222/devtools/page/A2D0B4CAD72CA5453578044D202FB37A');

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

ws.addEventListener('open', async () => {
    try {
        await sendCommand('DOM.enable');
        
        const result = await sendCommand('Runtime.evaluate', {
            expression: `(async () => {
                // 1. Update Headline
                let log = [];
                const editBtn = document.querySelector('a[aria-label*="Profili düzenle"], button[aria-label*="Profili düzenle"]');
                if (editBtn) {
                    editBtn.click();
                    await new Promise(r => setTimeout(r, 2000));
                    
                    const inputs = Array.from(document.querySelectorAll('div[role="dialog"] input[type="text"], div[role="dialog"] textarea'));
                    for(let el of inputs) {
                        const label = (el.previousElementSibling ? el.previousElementSibling.innerText : '').toLowerCase();
                        if (label.includes('başlık') || label.includes('headline') || el.id.includes('headline')) {
                            el.value = 'Founder & Chief Architect @ ALPAR AI | AI Trust & Accountability | ZKP-Powered Auditing | Teknopark Istanbul';
                            el.dispatchEvent(new Event('input', {bubbles: true}));
                            log.push('Headline updated');
                        }
                    }
                    
                    const saveBtn = document.querySelector('div[role="dialog"] button.artdeco-button--primary');
                    if(saveBtn) { saveBtn.click(); log.push('Headline saved'); }
                    
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    log.push('Headline edit button not found');
                }
                
                // 2. Update About
                const aboutBtn = document.querySelector('a[aria-label*="Hakkında kısmını düzenle"], button[aria-label*="Hakkında kısmını düzenle"]');
                if (aboutBtn) {
                    aboutBtn.click();
                    await new Promise(r => setTimeout(r, 2000));
                    
                    const txt = document.querySelector('div[role="dialog"] textarea');
                    if (txt) {
                        txt.value = 'Building the world\\'s first independent AI auditing platform. Specializing in ZKP cryptography and EU AI Act compliance.';
                        txt.dispatchEvent(new Event('input', {bubbles: true}));
                        log.push('About updated');
                        
                        const saveBtn = document.querySelector('div[role="dialog"] button.artdeco-button--primary');
                        if(saveBtn) { saveBtn.click(); log.push('About saved'); }
                    } else {
                        log.push('About textarea not found');
                    }
                } else {
                    log.push('About edit button not found');
                }
                
                return log.join(' | ');
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        
        console.log("LINKEDIN RESULT:", result.result.value);
    } catch (e) {
        console.error(e);
    } finally {
        ws.close();
    }
});
