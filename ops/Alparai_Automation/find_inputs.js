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
  
  console.log("Extracting all inputs and buttons on the page...");
  const data = await targetPage.evaluate(() => {
     const inputs = Array.from(document.querySelectorAll('input, textarea')).map(el => ({
         tag: el.tagName,
         type: el.type,
         name: el.name,
         ariaLabel: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'),
         value: el.value
     }));
     
     const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]')).map(el => ({
         text: el.innerText.trim(),
         ariaLabel: el.getAttribute('aria-label')
     })).filter(b => b.text.length > 0 && b.text.length < 30);
     
     return { inputs, buttons };
  });
  
  console.log("Inputs:", JSON.stringify(data.inputs, null, 2));
  console.log("Buttons:", JSON.stringify(data.buttons, null, 2));
  
  await browser.disconnect();
})();
