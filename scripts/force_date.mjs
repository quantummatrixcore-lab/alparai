import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        
        await page.evaluate(() => {
            const dateInput = document.querySelector('input[name="establishmentDate"]');
            if(dateInput) { 
                dateInput.value = '2024-01-01'; 
                dateInput.dispatchEvent(new Event('change', { bubbles: true })); 
                dateInput.dispatchEvent(new Event('input', { bubbles: true })); 
            }
            
            const radios = document.querySelectorAll('input[name="companyStatus"]');
            if(radios && radios.length > 1) { 
                // İkinci radyo düğmesi genelde "Kurulmadı" (not_registered vb.)
                radios[1].click();
            }
        });
        
        console.log('[OK] Tarih (2024-01-01) ve Şirket Durumu (Kurulmadı) DOM seviyesinde zorlandı.');
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
})();
