import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.log('Eventiqs sayfası bulunamadı!');
            process.exit(1);
        }

        const formData = await page.evaluate(() => {
            const fields = [];
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const name = input.getAttribute('name') || input.getAttribute('id') || input.getAttribute('placeholder');
                const type = input.tagName.toLowerCase() === 'input' ? input.getAttribute('type') : input.tagName.toLowerCase();
                
                // Find label
                let labelText = '';
                if (input.id) {
                    const labelEl = document.querySelector(`label[for="${input.id}"]`);
                    if (labelEl) labelText = labelEl.innerText;
                }
                if (!labelText && input.closest('div')) {
                    const parentLabel = input.closest('div').querySelector('label');
                    if (parentLabel) labelText = parentLabel.innerText;
                }
                
                let value = input.value;
                if (type === 'checkbox' || type === 'radio') {
                    value = input.checked ? 'SEÇİLİ (CHECKED)' : 'SEÇİLİ DEĞİL';
                } else if (type === 'file') {
                    value = input.files && input.files.length > 0 ? input.files[0].name : 'DOSYA SEÇİLMEDİ';
                }

                fields.push({
                    name: name,
                    type: type,
                    label: labelText.trim(),
                    value: value
                });
            });
            return fields;
        });

        console.log(JSON.stringify(formData, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
