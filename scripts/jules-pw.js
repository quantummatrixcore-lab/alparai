const { chromium } = require('@playwright/test');

async function run() {
  console.log('Connecting to Chrome...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  const page = pages.find(p => p.url().includes('jules'));
  
  if (!page) {
    console.log('Jules page not found in Playwright');
    await browser.close();
    return;
  }
  
  console.log('Jules page found. URL:', page.url());
  
  console.log('Clicking New Task button...');
  await page.locator('.new-task-button').first().click();
  await page.waitForTimeout(1500);
  
  console.log('Injecting prompt...');
  await page.locator('.ProseMirror').fill("Inspect src/lib/dummy-jules-bait.ts and recent code changes for doc or type improvements and open a Pull Request.");
  await page.waitForTimeout(500);
  
  console.log('Selecting repo...');
  // Click on the repo selector
  await page.locator('text=quantummatrixcore-lab/alparai-platform').click({ force: true }).catch(e => console.log('Repo click error', e));
  
  console.log('Clicking Start...');
  await page.locator('.start-task-button').click();
  
  await page.waitForTimeout(3000);
  console.log('Done.');
  await browser.close();
}

run().catch(console.error);
