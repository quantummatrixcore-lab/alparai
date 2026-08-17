const fs = require("fs");
const path = require("path");

const profilePath = "C:\\Users\\ercum\\.openchrome_profile\\Default\\Bookmarks";
const appDataPath =
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks";

let targetPath = fs.existsSync(profilePath)
  ? profilePath
  : fs.existsSync(appDataPath)
    ? appDataPath
    : null;

if (!targetPath) {
  console.error("Bookmarks dosyası bulunamadı!");
  process.exit(1);
}

console.log("Bookmarks okunuyor:", targetPath);
const data = JSON.parse(fs.readFileSync(targetPath, "utf8"));

const urls = [];

function extractUrls(node) {
  if (node.type === "url") {
    urls.push({ name: node.name, url: node.url });
  } else if (node.children) {
    node.children.forEach(extractUrls);
  }
}

if (data.roots) {
  Object.values(data.roots).forEach(extractUrls);
}

console.log(`Toplam ${urls.length} yer imi (bookmark) bulundu.\n`);

// AI platformlarını filtrele
const aiKeywords = [
  "chatgpt",
  "claude",
  "qwen",
  "grok",
  "perplexity",
  "gemini",
  "mistral",
  "deepseek",
  "poe",
  "copilot",
  "huggingface",
  "v0.dev",
  "bolt.new",
];

const aiBookmarks = urls.filter((item) => {
  return aiKeywords.some(
    (kw) => item.url.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw),
  );
});

console.log("=== YER İMLERİNDEKİ YAPAY ZEKA PLATFORMLARI VE SOHBETLER ===");
aiBookmarks.forEach((b, index) => {
  console.log(`${index + 1}. [${b.name}] -> ${b.url}`);
});

fs.writeFileSync(
  "C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\AI_BOOKMARKS.json",
  JSON.stringify(aiBookmarks, null, 2),
  "utf8",
);
