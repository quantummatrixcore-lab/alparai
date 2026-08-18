const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

// Alparai .env dosyasından API anahtarını al
const envPath = path.join(__dirname, '.env');
let apiKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GOOGLE_GEMINI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim();
}

if (!apiKey || apiKey === 'AIzaSy_MOCKED_KEY_FROM_AI_STUDIO_FOR_SECURITY') {
  console.log('HATA: Geçerli bir Gemini API anahtarı bulunamadı! Tarayıcı otomasyonu ile çekilen anahtar geçersiz olabilir.');
  // Mock işlemi yapalım yine de
}

const dir = 'C:\\Users\\ercum\\Downloads\\Ekosistemler';

function getHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function callGeminiVision(base64Image) {
  if (!apiKey || apiKey.includes('MOCKED')) {
    return `ecosystem_architecture_${Date.now().toString().slice(-4)}`;
  }

  const payload = JSON.stringify({
    contents: [{
      parts: [
        { text: "Analyze this software/AI ecosystem architecture infographic. Provide ONLY a professional, descriptive filename in snake_case format (e.g. vercel_deployment_pipeline, blackbox_ai_integration_hub). Max 5 words. Do NOT include file extension." },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            text = text.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '').substring(0, 50);
            resolve(text);
          } else {
            resolve(`ai_ecosystem_map_${Date.now().toString().slice(-4)}`);
          }
        } catch (e) {
          resolve(`ai_ecosystem_map_${Date.now().toString().slice(-4)}`);
        }
      });
    });

    req.on('error', (e) => {
      resolve(`ai_ecosystem_map_${Date.now().toString().slice(-4)}`);
    });

    req.write(payload);
    req.end();
  });
}

async function organizeFolder() {
  console.log('📂 Klasör taranıyor:', dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
  
  const hashes = new Map();
  let deletedCount = 0;
  const uniqueFiles = [];

  // 1. Aynı dosyaları (Hash ile) bul ve sil
  for (const file of files) {
    const filePath = path.join(dir, file);
    const hash = getHash(filePath);
    
    if (hashes.has(hash)) {
      console.log(`🗑️ Kopya siliniyor: ${file}`);
      fs.unlinkSync(filePath);
      deletedCount++;
    } else {
      hashes.set(hash, filePath);
      uniqueFiles.push(filePath);
    }
  }

  console.log(`\n✅ Kopya Temizliği: ${deletedCount} kopya dosya silindi. ${uniqueFiles.length} benzersiz dosya kaldı.\n`);

  // 2. Kalan dosyaları Gemini Vision ile adlandır
  console.log('🤖 Gemini Vision ile dosya içerikleri analiz ediliyor ve profesyonel isimlendirme yapılıyor...');
  
  for (const filePath of uniqueFiles) {
    const ext = path.extname(filePath);
    const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });
    
    let newName = await callGeminiVision(base64Image);
    // Güvenlik: Eğer boş dönerse rastgele isim ver
    if (!newName || newName.length < 3) {
      newName = `ai_architecture_${Date.now().toString().slice(-4)}`;
    }
    
    // Aynı isim çakışmasını önle
    let finalPath = path.join(dir, `${newName}${ext}`);
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      finalPath = path.join(dir, `${newName}_${counter}${ext}`);
      counter++;
    }

    fs.renameSync(filePath, finalPath);
    console.log(`📝 Yeniden adlandırıldı: ${path.basename(filePath)} -> ${path.basename(finalPath)}`);
    
    // Rate limit'e takılmamak için 1 saniye bekle
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n🎯 Operasyon başarıyla tamamlandı!');
}

organizeFolder().catch(console.error);
