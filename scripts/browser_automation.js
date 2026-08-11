const puppeteer = require("puppeteer-core");
const { execSync } = require("child_process");

(async () => {
  console.log("Fetching targets from CDP via curl...");

  const getTargets = () => {
    const data = execSync("curl -s http://[::1]:9222/json").toString();
    return JSON.parse(data);
  };

  const targets = getTargets();

  // 1. Cloudflare Security Events
  console.log("--- CLOUDFLARE ---");
  const cfTarget = targets.find(
    (t) => t.url.includes("dash.cloudflare.com") && t.url.includes("security/events"),
  );
  if (cfTarget && cfTarget.webSocketDebuggerUrl) {
    console.log("Connecting to Cloudflare tab...");
    const browser = await puppeteer.connect({ browserWSEndpoint: cfTarget.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const cfPage = pages[0]; // connected directly to the target

    const events = await cfPage.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
      return rows
        .map((r) => r.innerText.replace(/\n/g, " | "))
        .filter((r) => r.includes("Block") || r.includes("Challenge") || r.includes("Log"));
    });
    console.log("Blocked/Challenged Events:", events.slice(0, 5));
    await browser.disconnect();
  } else {
    console.log("Cloudflare tab not found.");
  }

  // 2. Hacker News
  console.log("--- HACKER NEWS ---");
  const hnTarget = targets.find((t) => t.url.includes("news.ycombinator.com/submit"));
  if (hnTarget && hnTarget.webSocketDebuggerUrl) {
    console.log("Connecting to HN tab...");
    const browser = await puppeteer.connect({ browserWSEndpoint: hnTarget.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const hnPage = pages[0];

    const url = await hnPage.$eval('input[name="url"]', (el) => el.value).catch(() => null);
    if (url && !url.includes("ref=hn")) {
      const newUrl = url.includes("?") ? url + "&ref=hn" : url + "?ref=hn";
      await hnPage.evaluate((newUrl) => {
        document.querySelector('input[name="url"]').value = newUrl;
      }, newUrl);
      console.log("HN URL updated to:", newUrl);

      await hnPage.click('input[type="submit"]');
      console.log("Clicked HN Submit button.");
      await new Promise((r) => setTimeout(r, 3000));
    } else {
      console.log("HN URL already has ref=hn or is empty:", url);
    }
    await browser.disconnect();
  } else {
    console.log("HN tab not found.");
  }

  // 3. Reddit
  console.log("--- REDDIT ---");
  const redditTarget = targets.find((t) => t.url.includes("reddit.com/r/SideProject/submit"));
  if (redditTarget && redditTarget.webSocketDebuggerUrl) {
    console.log("Connecting to Reddit tab...");
    const browser = await puppeteer.connect({
      browserWSEndpoint: redditTarget.webSocketDebuggerUrl,
    });
    const pages = await browser.pages();
    const redditPage = pages[0];

    const updated = await redditPage.evaluate(() => {
      let modified = false;
      const inputs = Array.from(
        document.querySelectorAll('input, textarea, div[contenteditable="true"]'),
      );
      for (const input of inputs) {
        if (
          input.value &&
          input.value.includes("alparai.com") &&
          !input.value.includes("ref=reddit")
        ) {
          const newUrl = input.value.includes("?")
            ? input.value + "&ref=reddit"
            : input.value + "?ref=reddit";

          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          );
          if (setter) {
            setter.set.call(input, newUrl);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            modified = true;
          } else {
            input.value = newUrl;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            modified = true;
          }
        }

        if (
          input.isContentEditable &&
          input.innerText &&
          input.innerText.includes("alparai.com") &&
          !input.innerText.includes("ref=reddit")
        ) {
          input.innerText = input.innerText.replace(
            /alparai\.com(\/?)(?![\w\-\?=&])/g,
            "alparai.com/?ref=reddit",
          );
          input.dispatchEvent(new Event("input", { bubbles: true }));
          modified = true;
        }
      }
      return modified;
    });

    if (updated) {
      console.log("Reddit URL updated with ?ref=reddit");
    } else {
      console.log("Reddit URL not found or already has ref=reddit");
    }

    const clicked = await redditPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const postBtn = buttons.find((b) => b.innerText.includes("Post"));
      if (postBtn && !postBtn.disabled) {
        postBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log("Clicked Reddit Post button.");
      await new Promise((r) => setTimeout(r, 3000));
    } else {
      console.log("Reddit Post button not found or disabled.");
    }
    await browser.disconnect();
  } else {
    console.log("Reddit tab not found.");
  }

  console.log("Done.");
})();
