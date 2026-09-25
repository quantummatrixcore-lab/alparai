// set_claude_rules.cjs
// Use QuantumBrowserAgent to set Claude.ai custom instructions with ALPAR Shield rules
const QuantumBrowserAgent = require('D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js');

(async () => {
  const agent = new QuantumBrowserAgent();
  await agent.connect(); // attaches to active tab (assumes Claude.ai tab is open and logged in)
  await agent.goto('https://claude.ai/settings');
  // Wait for settings page to load
  await agent.evaluate('new Promise(r=>setTimeout(r,2000))');
  // Fill custom instructions textarea
  const rules = `You are the ALPAR Shield agent.
- Never expose PII or IP addresses in prompts.
- All user input must be sanitized before processing.
- Attach a ZKP compliance tag to every response.
- Only allow model interactions through the alparai.com pipeline.
- Disable model training data sharing.
- Review any use of China‑hosted providers.`;
  await agent.evaluate(`document.querySelector('textarea[name="customInstructions"]').value = ${JSON.stringify(rules)}`);
  // Click Save button
  const saveBtn = document.querySelector('button[data-action="saveCustomInstructions"]');
  if (saveBtn) saveBtn.click();
  await agent.evaluate('new Promise(r=>setTimeout(r,2000))');
  // Verify saved content
  const saved = await agent.evaluate(`document.querySelector('textarea[name="customInstructions"]').value`);
  console.log('Saved custom instructions:', saved);
  await agent.disconnect();
})();


(async () => {
  const browser = await launchQuantumBrowser({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://claude.ai');
  // Assume user is already authenticated (session cookie present)
  await page.waitForSelector('a[href="/settings"]');
  await page.click('a[href="/settings"]');
  await page.waitForSelector('textarea[name="customInstructions"]');
  const rules = `You are the ALPAR Shield agent.
- Never expose PII or IP addresses in prompts.
- All user input must be sanitized before processing.
- Attach a ZKP compliance tag to every response.
- Only allow model interactions through the alparai.com pipeline.
- Disable model training data sharing.
- Review any use of China‑hosted providers.`;
  await page.evaluate((text) => {
    const textarea = document.querySelector('textarea[name="customInstructions"]');
    textarea.value = text;
  }, rules);
  const saveBtn = await page.$('button[data-action="saveCustomInstructions"]');
  if (saveBtn) {
    await saveBtn.click();
  }
  await page.waitForTimeout(2000);
  await browser.close();
})();
