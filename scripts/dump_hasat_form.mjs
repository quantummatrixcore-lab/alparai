import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.error('Eventiqs sayfası bulunamadı.');
            process.exit(1);
        }

        const formData = await page.evaluate(() => {
            const result = [];
            // Tüm label ve form kontrol çiftlerini topla
            const formGroups = document.querySelectorAll('.form-group, .mb-3, .mb-4, div');
            
            // Tüm input, select, textarea elemanlarını tara
            const elements = document.querySelectorAll('input, select, textarea');
            elements.forEach(el => {
                const name = el.getAttribute('name') || el.id || el.getAttribute('placeholder') || 'isimsiz';
                const type = el.getAttribute('type') || el.tagName.toLowerCase();
                
                // İlgili label'ı bul
                let labelText = '';
                if (el.id) {
                    const l = document.querySelector(`label[for="${el.id}"]`);
                    if (l) labelText = l.innerText.trim();
                }
                if (!labelText) {
                    const parent = el.closest('div');
                    if (parent) {
                        const l = parent.querySelector('label');
                        if (l) labelText = l.innerText.trim();
                    }
                }
                if (!labelText) {
                    labelText = el.getAttribute('placeholder') || name;
                }

                let value = el.value;
                if (type === 'checkbox' || type === 'radio') {
                    value = el.checked ? 'SEÇİLİ (Checked)' : 'SEÇİLİ DEĞİL (Unchecked)';
                } else if (type === 'file') {
                    value = el.files && el.files.length > 0 ? el.files[0].name : '(Dosya yüklenmedi)';
                } else if (el.tagName.toLowerCase() === 'select') {
                    const selectedOption = el.options[el.selectedIndex];
                    value = selectedOption ? `${selectedOption.text} (kod: ${selectedOption.value})` : el.value;
                }

                result.push({
                    name,
                    type,
                    label: labelText,
                    value: value || '(Boş)'
                });
            });

            return result;
        });

        // Benzersiz elemanları filtrele
        const seen = new Set();
        const uniqueData = formData.filter(item => {
            const key = item.name + '_' + item.label;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        fs.writeFileSync('D:\\03_ALPARAI\\HASAT_2026_BASVURU\\form_dump.json', JSON.stringify(uniqueData, null, 2), 'utf8');
        console.log('Form verileri başarıyla çekildi. Eleman sayısı:', uniqueData.length);
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
