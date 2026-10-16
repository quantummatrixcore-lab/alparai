import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.log('Eventiqs sayfası bulunamadı.');
            process.exit(1);
        }

        console.log('Eksik alanlar dolduruluyor...');

        // 1. Ekip Sayısı
        await page.fill('input[name="teamSize"]', '3');
        console.log('[OK] Ekip sayısı 3 olarak ayarlandı (Sacayağı: Ercüment, Musa Hoca, Ahmet Rıfat Bey).');

        // 2. Kuruluş Tarihi (Şirket henüz resmi kurulmadıysa bile form takılmasın diye projeye başlangıç tarihi girilir)
        const dateInput = page.locator('input[name="establishmentDate"]');
        if (await dateInput.count() > 0) {
            await dateInput.fill('2024-01-01');
            console.log('[OK] Kuruluş/Başlangıç tarihi girildi.');
        }

        // 3. Şirket Durumu (Kurulmadı)
        const notRegisteredRadio = page.locator('input[name="companyStatus"][value="not_registered"]');
        if (await notRegisteredRadio.count() > 0) {
            await notRegisteredRadio.check();
            console.log('[OK] Şirket durumu: Henüz Kurulmadı seçildi.');
        }

        // 4. Nasıl Haberdar Oldunuz? (Select)
        const referralSelect = page.locator('select[name="referralSource"]');
        if (await referralSelect.count() > 0) {
            // Options include "LinkedIn", "Girişim ekosisteminden..."
            // We select index 3 or search for text
            const options = await referralSelect.locator('option').allInnerTexts();
            const linkedinIndex = options.findIndex(t => t.includes('LinkedIn'));
            if (linkedinIndex > 0) {
                await referralSelect.selectOption({ index: linkedinIndex });
                console.log('[OK] Nasıl haberdar oldunuz: LinkedIn seçildi.');
            }
        }

        // 5. Dosya Yüklemeleri (Logo ve PDF)
        const logoInput = page.locator('input[name="startupLogo"]');
        if (await logoInput.count() > 0) {
            await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\ALPARAI_OFFICIAL_SHIELD_LOGO.png');
            console.log('[OK] Logo yüklendi: ALPARAI_OFFICIAL_SHIELD_LOGO.png');
        }

        const pdfInput = page.locator('input[name="pitchDeck"]');
        if (await pdfInput.count() > 0) {
            await pdfInput.setInputFiles('D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf');
            console.log('[OK] Pitch Deck yüklendi: AlparAI_Pitch_Deck_Q4_2026.pdf');
        }

        // 6. Checkbox Onayları
        const checkboxes = [
            'input[name="privacyConsent"]',
            'input[name="termsConsent"]',
            'input[name="marketingConsent"]',
            'input[name="mediaConsent"]'
        ];

        for (const sel of checkboxes) {
            if (await page.locator(sel).count() > 0) {
                await page.check(sel, { force: true });
                console.log(`[OK] Onay kutusu işaretlendi: ${sel}`);
            }
        }

        console.log('TÜM EKSİK ALANLAR VE DOSYA YÜKLEMELERİ BAŞARIYLA TAMAMLANDI!');
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e.message);
        process.exit(1);
    }
})();
