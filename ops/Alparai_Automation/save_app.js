const puppeteer = require('puppeteer-core');

(async () => {
  console.log("Connecting to Chrome...");
  const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222', defaultViewport: null });
  
  const pages = await browser.pages();
  let targetPage = pages.find(p => p.url().includes('console.cloud.google.com'));
  
  if (!targetPage) {
    console.log("Target tab not found. Exiting.");
    process.exit(1);
  }
  
  console.log("Verifying emails...");
  const bodyText = await targetPage.evaluate(() => document.body.innerText);
  const emailsVerified = bodyText.includes('quantum.matrix.core@gmail.com');
  console.log("User support and developer email verification status: " + emailsVerified);
  
  console.log("Updating App Name to 'ALPAR AI'...");
  await targetPage.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const appNameInput = inputs[0]; 
      
      if(appNameInput) {
          appNameInput.focus();
          appNameInput.value = 'ALPAR AI';
          appNameInput.dispatchEvent(new Event('input', { bubbles: true }));
          appNameInput.dispatchEvent(new Event('change', { bubbles: true }));
          appNameInput.blur();
      }
  });
  
  console.log("Clicking Save...");
  const saved = await targetPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const saveBtn = btns.find(b => b.innerText.trim() === 'Save' || b.innerText.trim() === 'Kaydet');
      if(saveBtn && saveBtn.offsetHeight > 0) {
          saveBtn.click();
          return true;
      }
      return false;
  });
  console.log("Save button clicked: " + saved);
  
  console.log("Waiting for save to complete...");
  await new Promise(r => setTimeout(r, 8000));
  
  console.log("Taking final screenshot...");
  await targetPage.screenshot({ path: 'D:/Alparai/screenshot_final.png' });
  
  await browser.disconnect();
  console.log("All tasks completed.");
})();
