const fs = require('fs');
const path = require('path');

// ALPARAI SINAVI (SPARK 02:35Z)
// Acik Kitap Sınavı: Yapısı, verisi, yayını, kapıları. Hakikat Kartına göre ölçülür.

function runExam() {
    let score = 0;
    const maxScore = 5;
    const errors = [];
    
    // Soru 1: Hakikat Kartı mevcut mu?
    const kartPath = path.join(__dirname, '../HAKIKAT_KARTI.md');
    if (fs.existsSync(kartPath)) {
        score++;
    } else {
        errors.push("Hata: HAKIKAT_KARTI.md bulunamadı.");
    }

    // Soru 2: Yasaklı Hayalet Altyapılar var mı? (Supabase, Hetzner, Vercel)
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    let hasGhosts = false;
    const checkGhosts = (filePath) => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            if (content.includes('supabase') || content.includes('hetzner') || content.includes('vercel')) {
                hasGhosts = true;
                errors.push(`Hata: ${filePath} dosyasında yasaklı hayalet altyapı izi bulundu.`);
            }
        }
    };
    checkGhosts(envPath);
    checkGhosts(envExamplePath);
    checkGhosts(packageJsonPath);
    
    if (!hasGhosts) score++;

    // Soru 3: Dil/Çatı (Next.js) teyidi
    if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.dependencies && pkg.dependencies.next) {
            score++;
        } else {
            errors.push("Hata: Next.js bağımlılığı bulunamadı. Dil/Çatı ihlali.");
        }
    } else {
        errors.push("Hata: package.json bulunamadı.");
    }

    // Soru 4: Ev/Host DeHost mu? (VDS IP si var mı?)
    const hakikatKart = fs.existsSync(kartPath) ? fs.readFileSync(kartPath, 'utf8') : '';
    if (hakikatKart.includes('45.143.4.92')) {
        score++;
    } else {
        errors.push("Hata: Ev sunucu bilgisi (45.143.4.92) kartta veya yapılandırmada yok.");
    }

    // Soru 5: Veri / Hafıza Upstash Redis mi?
    if (hakikatKart.toLowerCase().includes('upstash redis')) {
        score++;
    } else {
        errors.push("Hata: Veri kaynağı Upstash Redis olarak belirtilmemiş.");
    }

    console.log(`--- ALPARAI SINAV SONUCU ---`);
    console.log(`Skor: ${score}/${maxScore}`);
    if (errors.length > 0) {
        console.error("İHLALLER:");
        errors.forEach(e => console.error(" - " + e));
    }

    if (score === maxScore) {
        console.log("SONUÇ: GECTI. (ONAY_ANAHTARI_VERILDI)");
        fs.writeFileSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'), 'ALPARAI-MASTER-KEY-2026', 'utf8');
        process.exit(0);
    } else {
        console.error("SONUÇ: KALDI. ÇALIŞMA DÖNGÜSÜNE GERİ DÖN.");
        if (fs.existsSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'))) {
            fs.unlinkSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'));
        }
        process.exit(1);
    }
}

runExam();
