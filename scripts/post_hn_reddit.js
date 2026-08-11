const puppeteer = require("puppeteer-core");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function typeHumanLike(page, text) {
  for (const char of text) {
    await page.keyboard.press(char, { delay: Math.floor(Math.random() * 20) + 30 });
  }
}

(async () => {
  console.log("Connecting to existing Chrome...");
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: null,
  });

  // === HACKER NEWS ===
  console.log("--- POSTING TO HACKER NEWS ---");
  const hnPage = await browser.newPage();
  await hnPage.goto("https://news.ycombinator.com/submit", { waitUntil: "networkidle2" });

  // Wait for title input
  await hnPage
    .waitForSelector('input[name="title"]', { timeout: 10000 })
    .catch(() => console.log("HN title input not found"));

  // Clear and type
  await hnPage.evaluate(() => (document.querySelector('input[name="title"]').value = ""));
  await hnPage.type(
    'input[name="title"]',
    "Show HN: ALPAR AI - Trust infrastructure for AI accountability.",
    { delay: 35 },
  );

  await hnPage.evaluate(() => (document.querySelector('input[name="url"]').value = ""));
  await hnPage.type('input[name="url"]', "https://www.alparai.com/?ref=hn", { delay: 35 });

  await hnPage.click('input[type="submit"]');
  console.log("HN Submitted.");
  await delay(3000);
  await hnPage.close();

  // === REDDIT ===
  console.log("--- POSTING TO REDDIT ---");
  const redditPage = await browser.newPage();
  await redditPage.goto("https://www.reddit.com/r/SideProject/submit", {
    waitUntil: "networkidle2",
  });

  console.log("Waiting for Reddit page to load...");
  await delay(5000); // Wait for React/ShadowDOM to hydrate

  // Navigate via Tab
  // This is highly specific to Reddit's current UI, but we can try to find the title area
  const foundTitle = await redditPage.evaluate(() => {
    const textareas = Array.from(document.querySelectorAll("textarea"));
    const titleArea = textareas.find(
      (t) => t.placeholder && t.placeholder.toLowerCase().includes("title"),
    );
    if (titleArea) {
      titleArea.focus();
      return true;
    }
    return false;
  });

  if (foundTitle) {
    console.log("Typing Reddit Title...");
    await redditPage.keyboard.type(
      "Show r/SideProject: We built ALPAR AI - A trust infrastructure for AI accountability.",
      { delay: 35 },
    );

    // Press Tab to move to the next field (usually URL or body)
    await redditPage.keyboard.press("Tab", { delay: 100 });

    console.log("Typing Reddit URL/Body...");
    await redditPage.keyboard.type("https://www.alparai.com/?ref=reddit", { delay: 35 });

    // Find Post button and click
    const clickedPost = await redditPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const postBtn = buttons.find((b) => b.innerText.trim().toLowerCase() === "post");
      if (postBtn && !postBtn.disabled) {
        postBtn.click();
        return true;
      }
      return false;
    });

    if (clickedPost) {
      console.log("Reddit Submitted.");
    } else {
      console.log(
        "Reddit Post button not found or disabled. It might require manual intervention.",
      );
    }
  } else {
    console.log("Could not find Reddit Title textarea.");
  }

  await delay(3000);
  await redditPage.close();

  console.log("--- CLOUDFLARE ---");
  const cfPage = await browser.newPage();
  await cfPage.goto(
    "https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/alparai.com/security/events",
    { waitUntil: "networkidle2" },
  );
  await delay(5000); // Wait for grid
  const events = await cfPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
    return rows
      .map((r) => r.innerText.replace(/\n/g, " | "))
      .filter((r) => r.includes("Block") || r.includes("Challenge") || r.includes("Log"));
  });
  console.log("Cloudflare Blocked/Challenged Events:", events.slice(0, 5));
  await cfPage.close();

  await browser.disconnect();
  console.log("Done.");
})();
