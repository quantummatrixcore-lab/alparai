import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const locales = ['en', 'tr'];

for (const locale of locales) {
  const filePath = path.join(rootDir, 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.products) {
    data.products = {};
  }

  if (!data.products.eu_ai_act_page) {
    if (data.eu_ai_act_page) {
      data.products.eu_ai_act_page = data.eu_ai_act_page;
      delete data.eu_ai_act_page;
      console.log(`[${locale}] Moved eu_ai_act_page from root to products.eu_ai_act_page`);
    } else {
      data.products.eu_ai_act_page = {};
      console.log(`[${locale}] Created empty products.eu_ai_act_page`);
    }
  }

  // Ensure all required keys for src/app/[locale]/products/eu-ai-act/page.tsx exist
  if (!data.products.eu_ai_act_page.badge) {
    data.products.eu_ai_act_page.badge = locale === 'tr' ? 'Kurumsal Uyum Modülü' : 'Enterprise Compliance';
    console.log(`[${locale}] Added missing badge to products.eu_ai_act_page`);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${locale}] Verified products.eu_ai_act_page:`, Object.keys(data.products.eu_ai_act_page));
}
