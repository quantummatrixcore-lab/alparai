const fs = require("fs");

const bookmarkFiles = [
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1\\Bookmarks",
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 2\\Bookmarks",
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 7\\Bookmarks",
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 8\\Bookmarks",
  "C:\\Users\\ercum\\AppData\\Local\\Google\\Chrome\\User Data\\AgentProfile\\Default\\Bookmarks",
];

const urls = [];

function extractUrls(node, sourceFile) {
  if (node.type === "url") {
    urls.push({ name: node.name, url: node.url, source: sourceFile });
  } else if (node.children) {
    node.children.forEach((child) => extractUrls(child, sourceFile));
  }
}

bookmarkFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (data.roots) {
        Object.values(data.roots).forEach((root) => extractUrls(root, filePath));
      }
    } catch (e) {
      console.error("Hata okuma:", filePath, e.message);
    }
  }
});

console.log(`Tüm profillerden Toplam ${urls.length} yer imi tarandı.`);

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
  "v0",
  "bolt",
];

const aiBookmarks = urls.filter((item) => {
  return aiKeywords.some(
    (kw) => item.url.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw),
  );
});

console.log(
  `\n=== YER İMLERİNDEKİ BULUNAN AI PLATFORMLARI VE SOHBETLER (${aiBookmarks.length} Adet) ===\n`,
);
aiBookmarks.forEach((b, i) => {
  console.log(`${i + 1}. [${b.name}] -> ${b.url}`);
});

fs.writeFileSync(
  "C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\ALL_AI_BOOKMARKS.json",
  JSON.stringify(aiBookmarks, null, 2),
  "utf8",
);
