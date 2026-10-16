const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    try {
        console.log('Connecting to Chrome CDP on 9222...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        const pages = contexts.length > 0 ? contexts[0].pages() : [];
        
        let targetPage = null;
        for (const page of pages) {
            const url = page.url();
            console.log('Found page:', url);
            if (url.includes('hasat.eventiqs.com')) {
                targetPage = page;
                break;
            }
        }
        
        if (!targetPage) {
            console.log('Eventiqs sayfasini bulamadim! Lutfen Chrome uzerinde o sayfayi acik tutun.');
            process.exit(1);
        }
        
        console.log('Page found. Injecting script to dump input fields...');
        const fields = await targetPage.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
            return inputs.map(i => ({
                tag: i.tagName,
                id: i.id,
                name: i.name,
                type: i.type,
                placeholder: i.placeholder,
                className: i.className
            }));
        });
        
        console.log('Fields found:', fields.length);
        console.log(fields.slice(0, 20));
        
        // Wait, if I want to fill it, I need to know the IDs. I will just output them for now.
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e);
    }
})();
