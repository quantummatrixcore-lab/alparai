import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..", "src", "app");

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) {
    return filelist;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkSync(fullPath, filelist);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      filelist.push(fullPath);
    }
  }
  return filelist;
}

const files = walkSync(appDir);
const violations = [];

const edgeRegex = /export\s+const\s+runtime\s*=\s*['"]edge['"]/;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  if (edgeRegex.test(content)) {
    violations.push(filePath);
  }
}

if (violations.length > 0) {
  console.error("❌ HATA: Aşağıdaki dosyalarda yasaklı 'edge' runtime tespit edildi:");
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  console.error("\nEdge runtime, PostgreSQL bağlantıları ve nodejs API'leri ile uyumsuzdur. Kaldırın veya 'nodejs' kullanın.");
  process.exit(1);
} else {
  console.log("✅ Başarılı: src/app altında yasaklı 'edge' runtime bulunamadı.");
  process.exit(0);
}
