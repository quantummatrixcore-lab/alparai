const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
  const wsUrl = "ws://localhost:9222/devtools/page/708DA2D3DFC93BE161A464999441A001";
  const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
  const pages = await browser.pages();
  const page = pages[0]; // Assuming it's the connected page

  const report = {
    errors: [],
    failedRequests: [],
    visited: [],
  };

  page.on("console", (msg) => {
    if (msg.type() === "error") report.errors.push(`[${page.url()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    report.errors.push(`[${page.url()}] ${err.toString()}`);
  });

  page.on("response", (response) => {
    if (!response.ok() && response.request().resourceType() === "fetch") {
      report.failedRequests.push(`[${page.url()}] API ${response.status()} ${response.url()}`);
    }
  });

  // Extract all sidebar links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/admin"]')).map((a) => a.href);
  });

  const uniqueLinks = [...new Set(links)];

  for (const link of uniqueLinks) {
    console.log(`Testing ${link}`);
    try {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 15000 });
      report.visited.push(link);

      // Look for error boundaries or visual errors
      const pageText = await page.evaluate(() => document.body.innerText);
      if (
        pageText.includes("Application error: a client-side exception has occurred") ||
        pageText.includes("Something went wrong") ||
        pageText.includes("500 Internal Server Error")
      ) {
        report.errors.push(`[${link}] VISUAL ERROR BOUNDARY DETECTED`);
      }

      // Small delay to let client-side effects run
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      report.errors.push(`[${link}] NAVIGATION TIMEOUT/ERROR: ${e.message}`);
    }
  }

  fs.writeFileSync(
    "C:/Users/ercum/.gemini/antigravity/brain/22887cad-4cc6-4ee9-82ff-f1b695011ea2/scratch/test_report.json",
    JSON.stringify(report, null, 2),
  );
  console.log("Done");
  process.exit(0);
})();
