/* eslint-disable */
import { chromium } from "@playwright/test";

async function run() {
  console.log("Launching Chromium with remote debugging port 9222...");
  const context = await chromium.launchPersistentContext("d:\\Alparai\\chrome-profile", {
    headless: true,
    args: [
      "--remote-debugging-port=9222",
      "--no-sandbox",
      "--disable-gpu"
    ]
  });
  console.log("Chromium is running and listening on port 9222.");
  
  // Keep the process alive
  await new Promise(() => {});
}

run().catch(console.error);
