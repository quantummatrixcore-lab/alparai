const fs = require('fs');
const path = require('path');

// ALPARAI SINAVI (SPARK 02:35Z)
// Acik Kitap S�nav�: Yap�s�, verisi, yay�n�, kap�lar�. Hakikat Kart�na g�re �l��l�r.

function runExam() {
    let score = 0;
    const maxScore = 6;
    const errors = [];
    
    // Soru 1: Hakikat Kart� mevcut mu?
    const kartPath = path.join(__dirname, '../HAKIKAT_KARTI.md');
    if (fs.existsSync(kartPath)) {
        score++;
    } else {
        errors.push("Hata: HAKIKAT_KARTI.md bulunamad�.");
    }

    // Soru 2: Yasakl� Hayalet Altyap�lar var m�? (upstash, dehost, cloudflare)
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    let hasGhosts = false;
    const checkGhosts = (filePath) => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            if (content.includes('upstash') || content.includes('dehost') || content.includes('cloudflare')) {
                hasGhosts = true;
                errors.push(`Hata: ${filePath} dosyas�nda yasakl� hayalet altyap� izi bulundu.`);
            }
        }
    };
    checkGhosts(envPath);
    checkGhosts(envExamplePath);
    checkGhosts(packageJsonPath);
    
    if (!hasGhosts) score++;

    // Soru 3: Dil/�at� (Next.js) teyidi
    if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.dependencies && pkg.dependencies.next) {
            score++;
        } else {
            errors.push("Hata: Next.js ba��ml�l��� bulunamad�. Dil/�at� ihlali.");
        }
    } else {
        errors.push("Hata: package.json bulunamad�.");
    }

    // Soru 4: Ev/Host DeHost mu? (VDS IP si var m�?)
    const hakikatKart = fs.existsSync(kartPath) ? fs.readFileSync(kartPath, 'utf8') : '';
    if (hakikatKart.includes('45.143.4.92')) {
        score++;
    } else {
        errors.push("Hata: Ev sunucu bilgisi (45.143.4.92) kartta veya yap�land�rmada yok.");
    }

    // Soru 5: Veri / Haf�za Upstash Redis mi?
    if (hakikatKart.toLowerCase().includes('upstash redis')) {
        score++;
    } else {
        errors.push("Hata: Veri kayna�� Upstash Redis olarak belirtilmemi�.");
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
        console.error("�HLALLER:");
        errors.forEach(e => console.error(" - " + e));
    }

    if (score === maxScore) {
        console.log("SONU�: GECTI. (ONAY_ANAHTARI_VERILDI)");
        fs.writeFileSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'), 'ALPARAI-MASTER-KEY-2026', 'utf8');
        process.exit(0);
    } else {
        console.error("SONU�: KALDI. �ALI�MA D�NG�S�NE GER� D�N.");
        if (fs.existsSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'))) {
            fs.unlinkSync(path.join(__dirname, '../ONAY_ANAHTARI.txt'));
        }
        process.exit(1);
    }
}

runExam();
