const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = 'C:\\Users\\ercum\\Downloads\\Ekosistemler';

function getHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function organizeFolder() {
  console.log('📂 Klasör taranıyor:', dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
  
  const hashes = new Map();
  let deletedCount = 0;
  const uniqueFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const hash = getHash(filePath);
    
    if (hashes.has(hash)) {
      console.log(`🗑️ Kopya siliniyor: ${file}`);
      fs.unlinkSync(filePath);
      deletedCount++;
    } else {
      hashes.set(hash, filePath);
      uniqueFiles.push(file);
    }
  }

  console.log(`\n✅ Kopya Temizliği: ${deletedCount} kopya dosya silindi. ${uniqueFiles.length} benzersiz dosya kaldı.\n`);
  
  uniqueFiles.forEach((file, index) => {
     console.log(`BENZERSİZ: ${file}`);
  });
}

organizeFolder().catch(console.error);
