import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });

  const userPassword = 'AlparAI_2026_045c419b0749!';

  const fillScript = `
    (async function() {
      // 1. Select alparai.com domain
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

      // 2. Fill username ercument
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameInput = inputs.find(i => i.name === 'username' || i.name === 'name' || i.type === 'text');
      if (usernameInput) {
        usernameInput.value = 'ercument';
        usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 3. Fill passwords
      const passInputs = inputs.filter(i => i.type === 'password');
      for (const p of passInputs) {
        p.value = '${userPassword}';
        p.dispatchEvent(new Event('input', { bubbles: true }));
        p.dispatchEvent(new Event('change', { bubbles: true }));
      }

      await new Promise(r => setTimeout(r, 500));

      // 4. Click Save
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      const saveBtn = btns.find(b => b.innerText.trim().toLowerCase() === 'save' || b.value?.toLowerCase() === 'save');
      if (saveBtn) {
        saveBtn.click();
        return { success: true, method: 'clicked_save' };
      }

      return { success: false, reason: 'save_button_not_found' };
    })()
  `;

  const fillRes = await agent.send('Runtime.evaluate', { expression: fillScript, awaitPromise: true, returnByValue: true });
  console.log('Fill & Save result:', JSON.stringify(fillRes.result?.value, null, 2));

  await new Promise(r => setTimeout(r, 4000));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== PAGE TEXT AFTER CREATING USER ===');
  console.log(pageText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
