const puppeteer = require("puppeteer-core");
const fs = require("fs");

const BASE_URL = "http://localhost:3000/en/admin";

async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function run360Spider() {
  console.log("Starting 360° Admin Spider (Connecting to existing Chrome)...");
  let browser;
  try {
    // Connect to the already running openchrome profile on port 9222
    browser = await puppeteer.connect({
      browserURL: "http://localhost:9222",
      defaultViewport: null, // use existing viewport
    });

    const pages = await browser.pages();
    let page = pages.length > 0 ? pages[0] : await browser.newPage();

    console.log("Connected to browser successfully.");

    // Go to Admin dashboard
    try {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    } catch (e) {
      console.log("Initial load timeout, retrying...");
      await delay(5000);
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    }
    console.log("Navigated to Admin Dashboard");

    await delay(8000); // Wait for hydration and auth

    // Collect all links in the admin panel
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));
      return anchors
        .map((a) => a.href)
        .filter((href) => href.includes("/admin/"))
        .filter((v, i, a) => a.indexOf(v) === i); // Unique
    });

    console.log(`Found ${links.length} unique Admin routes to test.`);

    let report = `# 360° Admin Panel Resilience Report\n\nDate: ${new Date().toISOString()}\n\n`;

    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      console.log(`Testing route [${i + 1}/${links.length}]: ${url}`);
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await delay(3000); // give it time to render fully

        // Find all buttons and count them
        const buttonsCount = await page.evaluate(() => document.querySelectorAll("button").length);

        // Take screenshot
        const routeName = url.split("/admin/")[1] || "dashboard";
        const safeName = routeName.replace(/\//g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const screenshotPath = `C:\\Users\\ercum\\.gemini\\antigravity\\brain\\55004a67-cc28-486c-99ae-71135b229e9c\\scratch\\360_${safeName}.png`;
        await page.screenshot({ path: screenshotPath });

        report += `## Route: ${url}\n- **Status:** PASS\n- **Interactive Elements (Buttons):** ${buttonsCount}\n- **Screenshot Captured:** Yes\n\n`;

        console.log(`PASS: ${url}`);
      } catch (err) {
        console.error(`FAIL: ${url} - ${err.message}`);
        report += `## Route: ${url}\n- **Status:** FAIL\n- **Error:** ${err.message}\n\n`;
      }
    }

    // Write report
    fs.writeFileSync(
      "C:\\Users\\ercum\\.gemini\\antigravity\\brain\\55004a67-cc28-486c-99ae-71135b229e9c\\360-resilience-report.md",
      report,
    );
    console.log("360° Spider completed successfully. Report generated.");
  } catch (error) {
    console.error("Critical Spider Error:", error);
  } finally {
    if (browser) {
      browser.disconnect();
    }
  }
}

run360Spider();
