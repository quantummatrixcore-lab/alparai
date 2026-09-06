const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log("Connecting to Chrome...");
  const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222', defaultViewport: null });
  
  const pages = await browser.pages();
  let targetPage = pages.find(p => p.url().includes('console.cloud.google.com'));
  if (!targetPage && pages.length > 0) {
      targetPage = pages.find(p => p.url().startsWith('http'));
  }
  if (!targetPage) {
    console.log("No valid tabs found. Exiting.");
    process.exit(1);
  }
  
  console.log("Using tab: " + targetPage.url());
  console.log("Navigating to consent screen...");
  await targetPage.goto('https://console.cloud.google.com/apis/credentials/consent?project=alparai-prod', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 8000));
  
  console.log("Clicking Branding...");
  const clicked = await targetPage.evaluate(() => {
     const links = Array.from(document.querySelectorAll('a, button, div[role="button"], div[role="tab"], cf-item'));
     const branding = links.find(l => l.innerText.trim() === 'Branding' && l.offsetHeight > 0);
     if(branding) { branding.click(); return true; }
     return false;
  });
  
  if(clicked) {
     console.log("Clicked Branding. Waiting...");
     await new Promise(r => setTimeout(r, 5000));
     
     console.log("Clicking Edit...");
     const editClicked = await targetPage.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
         const editBtn = btns.find(b => b.innerText.match(/^edit$/i) && b.offsetHeight > 0);
         if(editBtn) { editBtn.click(); return true; }
         return false;
     });
     
     if (editClicked) {
         console.log("Clicked Edit. Waiting...");
         await new Promise(r => setTimeout(r, 5000));
         await targetPage.screenshot({ path: 'D:/Alparai/screenshot_edit_mode.png' });
         const html = await targetPage.evaluate(() => document.body.innerHTML);
         fs.writeFileSync('D:/Alparai/page_html_edit.txt', html);
         console.log("Saved HTML.");
     } else {
         console.log("Edit button not found.");
         const html = await targetPage.evaluate(() => document.body.innerHTML);
         fs.writeFileSync('D:/Alparai/page_html_branding.txt', html);
     }
  } else {
     console.log("Branding link not found.");
  }
  
  await browser.disconnect();
})();
