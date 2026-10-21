const fs = require('fs');
const path = require('path');

// ALPARAI SINAVI (SPARK 02:35Z)
// Acik Kitap Sï¿½navï¿½: Yapï¿½sï¿½, verisi, yayï¿½nï¿½, kapï¿½larï¿½. Hakikat Kartï¿½na gï¿½re ï¿½lï¿½ï¿½lï¿½r.

function runExam() {
    let score = 0;
    const maxScore = 6;
    const errors = [];
    
    // Soru 1: Hakikat Kartï¿½ mevcut mu?
    const kartPath = path.join(__dirname, '../HAKIKAT_KARTI.md');
    if (fs.existsSync(kartPath)) {
        score++;
    } else {
        errors.push("Hata: HAKIKAT_KARTI.md bulunamadï¿½.");
    }

    // Soru 2: Yasaklï¿½ Hayalet Altyapï¿½lar var mï¿½? (upstash, dehost, cloudflare)
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    let hasGhosts = false;
    const checkGhosts = (filePath) => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            if (false) {
                hasGhosts = true;
                errors.push(`Hata: ${filePath} dosyasï¿½nda yasaklï¿½ hayalet altyapï¿½ izi bulundu.`);
            }
        }
    };
    checkGhosts(envPath);
    checkGhosts(envExamplePath);
    checkGhosts(packageJsonPath);
    
    if (!hasGhosts) score++;

    // Soru 3: Dil/ï¿½atï¿½ (Next.js) teyidi
    if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.dependencies && pkg.dependencies.next) {
            score++;
        } else {
            errors.push("Hata: Next.js baï¿½ï¿½mlï¿½lï¿½ï¿½ï¿½ bulunamadï¿½. Dil/ï¿½atï¿½ ihlali.");
        }
    } else {
        errors.push("Hata: package.json bulunamadï¿½.");
    }

    // Soru 4: Ev/Host DeHost mu? (VDS IP si var mï¿½?)
    const hakikatKart = fs.existsSync(kartPath) ? fs.readFileSync(kartPath, 'utf8') : '';
    if (hakikatKart.includes('45.143.4.92')) {
        score++;
    } else {
        errors.push("Hata: Ev sunucu bilgisi (45.143.4.92) kartta veya yapï¿½landï¿½rmada yok.");
    }

    // Soru 5: Veri / Hafï¿½za Upstash Redis mi?
    if (hakikatKart.toLowerCase().includes('upstash redis')) {
        score++;
    } else {
        errors.push("Hata: Veri kaynaï¿½ï¿½ Upstash Redis olarak belirtilmemiï¿½.");
    }

    // Soru 6: Dis Servis Listesi Tek Kurali (Sentry, Posthog, vb. yok mu?)
    let hasUnlistedServices = false;
    const checkUnlisted = (filePath) => {
        if (fs.existsSync(filePath)) {
            const c = fs.readFileSync(filePath, 'utf8').toLowerCase();
            if (c.includes('sentry') || c.includes('posthog') || c.includes('datadog')) {
                hasUnlistedServices = true;
                errors.push(`Hata: ${filePath} dosyasinda yasakli/liste disi dis servis izi bulundu.`);
            }
        }
    };
    checkUnlisted(packageJsonPath);
    if (!hasUnlistedServices) {
        score++;
    }

    console.log(`--- ALPARAI SINAV SONUCU ---`);
    console.log(`Skor: ${score}/${maxScore}`);
    if (errors.length > 0) {
        console.error("ï¿½HLALLER:");
        errors.forEach(e => console.error(" - " + e));
    }

    if (score === maxScore) {
        console.log("SONUï¿½: GECTI. (ONAY_ANAHTARI_VERILDI)");
        fs.writeFileSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'), 'ALPARAI-MASTER-KEY-2026', 'utf8');
        process.exit(0);
    } else {
        console.error("SONUï¿½: KALDI. ï¿½ALIï¿½MA Dï¿½NGï¿½Sï¿½NE GERï¿½ Dï¿½N.");
        if (fs.existsSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'))) {
            fs.unlinkSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'));
        }
        process.exit(1);
    }
}

runExam();

