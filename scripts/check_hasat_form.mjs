import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const p of contexts[0].pages()) {
            if (p.url().includes('eventiqs.com')) {
                page = p;
                break;
            }
        }
        if (!page) {
            console.log('Eventiqs sayfasý bulunamadý!');
            process.exit(1);
        }

        console.log('Sayfa URL:', page.url());

        const formDetails = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('label, input, textarea, select, button'));
            const data = [];
            
            // Check form fields
            const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
            const fields = inputs.map(el => {
                const label = el.closest('div')?.querySelector('label')?.innerText || 
                              document.querySelector(`label[for="${el.id}"]`)?.innerText || 
                              el.placeholder || el.name;
                return {
                    name: el.name || el.id,
                    type: el.type,
                    label: label?.trim(),
                    value: el.type === 'checkbox' ? el.checked : el.value,
                    required: el.required
                };
            });

            // Check any error messages or alerts
            const errors = Array.from(document.querySelectorAll('.error, .invalid-feedback, [role="alert"], .text-danger')).map(e => e.innerText.trim()).filter(Boolean);

            // Check steps or tabs if multi-step
            const steps = Array.from(document.querySelectorAll('.step, .nav-item, [role="tab"], .wizard-step')).map(s => s.innerText.trim()).filter(Boolean);

            return { fields, errors, steps };
        });

        console.log('--- FORM ALANLARI VE MEVCUT DEÐERLERÝ ---');
        console.log(JSON.stringify(formDetails, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
