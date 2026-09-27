import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  console.log('--- CREATING EXACT USER ercument.erden@alparai.com IN PURELYMAIL ---');

  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });

  // 1. Navigate to user creation page
  await agent.send('Page.navigate', { url: 'https://purelymail.com/manage/user/new' });
  await new Promise(r => setTimeout(r, 2500));

  const userPassword = process.env.ADMIN_USER_PASSWORD || 'default_fallback_pass';

  // 2. Select domain alparai.com and fill username ercument.erden
  const createUserScript = `
    (async function() {
      // Select domain alparai.com
      const selects = Array.from(document.querySelectorAll('select'));
      const domainSelect = selects.find(s => s.name === 'domain' || s.name === 'domainName' || Array.from(s.options).some(o => o.text.includes('alparai.com')));
      if (domainSelect) {
        const option = Array.from(domainSelect.options).find(o => o.text.includes('alparai.com') || o.value.includes('alparai.com'));
        if (option) {
          domainSelect.value = option.value;
          domainSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      await new Promise(r => setTimeout(r, 500));

      // Fill username ercument.erden
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = inputs.find(i => i.name === 'username' || i.name === 'name' || i.type === 'text');
      if (usernameInput) {
        usernameInput.value = 'ercument.erden';
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Fill passwords
      const passInputs = inputs.filter(i => i.type === 'password');
      for (const p of passInputs) {
        p.value = '${userPassword}';
        p.dispatchEvent(new Event('input', { bubbles: true }));
        p.dispatchEvent(new Event('change', { bubbles: true }));
      }

      await new Promise(r => setTimeout(r, 500));

      // Click Save
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      const saveBtn = btns.find(b => b.innerText.trim().toLowerCase() === 'save' || b.value?.toLowerCase() === 'save');
      if (saveBtn) {
        saveBtn.click();
        return { success: true, method: 'clicked_save' };
      }

      return { success: false, reason: 'save_button_not_found' };
    })()
  `;

  const createRes = await agent.send('Runtime.evaluate', { expression: createUserScript, awaitPromise: true, returnByValue: true });
  console.log('Create user result:', JSON.stringify(createRes.result?.value, null, 2));

  await new Promise(r => setTimeout(r, 3500));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== USERS PAGE TEXT ===');
  console.log(pageText.result?.value);

  // Also check routing rules to add alias/catch-all for ercument.erden@alparai.com if needed
  console.log('Navigating to routing rules to verify ercument.erden@alparai.com routing...');
  await agent.send('Page.navigate', { url: 'https://purelymail.com/manage/routing' });
  await new Promise(r => setTimeout(r, 2500));

  const routingText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== ROUTING RULES PAGE TEXT ===');
  console.log(routingText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
