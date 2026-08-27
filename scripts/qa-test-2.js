const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

async function runQaTest2() {
  console.log("Connecting to existing browser over CDP for Languages & Mobile...");
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  let page = pages.find((p) => p.url().includes("alparai.com"));

  if (!page) {
    page = pages.find((p) => !p.url().includes("claude.ai"));
    if (!page) page = pages[0];
  }

  const reportPath = path.join(__dirname, "qa_report_2.md");
  const screenshotsDir = path.join(__dirname, "screenshots");
  let report = "## Diller ve Mobil Görünüm Testi\n\n";

  const languages = ["en", "tr", "de", "fr", "ru"];
  for (const lang of languages) {
    console.log(`Testing Language: ${lang}...`);
    const response = await page.goto(`https://www.alparai.com/${lang}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    const status = response ? response.status() : "Bilinmiyor";
    report += `### Dil: ${lang.toUpperCase()}\n- **Status:** ${status}\n`;
    await page.screenshot({ path: path.join(screenshotsDir, `lang_${lang}.png`), fullPage: true });
  }

  console.log("Testing Mobile Emulation (iPhone 13)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("https://www.alparai.com/en", { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(screenshotsDir, "mobile_emulation.png"),
    fullPage: true,
  });
  report += `### Mobil Görünüm (390x844)\n- Ekran görüntüsü alındı.\n\n`;

  console.log("Testing Header/Footer links...");
  const headerLinks = await page.$$eval("header a", (as) =>
    as.map((a) => a.href).filter((href) => href),
  );
  const footerLinks = await page.$$eval("footer a", (as) =>
    as.map((a) => a.href).filter((href) => href),
  );

  report += `### Header Navigasyon\n- Bulunan Link Sayısı: ${headerLinks.length}\n`;
  report += `### Footer Navigasyon\n- Bulunan Link Sayısı: ${footerLinks.length}\n`;

  await page.setViewportSize({ width: 1920, height: 1080 });

  fs.writeFileSync(reportPath, report);
  console.log("Test 2 completed.");
  await browser.disconnect();
}
runQaTest2().catch(console.error);
