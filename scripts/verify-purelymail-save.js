import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });

  console.log('--- ENTERING ALPARAI.COM AND CHECKING DNS ---');

  const fillAndCheckScript = `
    (async function() {
      // Find domain input
      const inputs = Array.from(document.querySelectorAll('input'));
      const textInput = inputs.find(i => i.type === 'text' || i.name === 'name' || i.name === 'domainName');
      if (textInput) {
        textInput.value = 'alparai.com';
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
        textInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Click "Check DNS records" button
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a'));
      const checkBtn = btns.find(b => b.innerText.toLowerCase().includes('check dns'));
      if (checkBtn) {
        checkBtn.click();
        return 'clicked_check_dns';
      }
      return 'check_btn_not_found';
    })()
  `;

  const checkRes = await agent.send('Runtime.evaluate', { expression: fillAndCheckScript, awaitPromise: true, returnByValue: true });
  console.log('Check DNS click:', checkRes.result?.value);

  await new Promise(r => setTimeout(r, 4000));

  // Now click Save button
  const saveScript = `
    (async function() {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      const saveBtn = btns.find(b => b.innerText.trim().toLowerCase() === 'save' || b.value?.trim().toLowerCase() === 'save');
      if (saveBtn) {
        saveBtn.click();
        return 'clicked_save';
      }
      return 'save_not_found';
    })()
  `;
  const saveRes = await agent.send('Runtime.evaluate', { expression: saveScript, awaitPromise: true, returnByValue: true });
  console.log('Save click:', saveRes.result?.value);

  await new Promise(r => setTimeout(r, 4000));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== PAGE TEXT AFTER SAVE ===');
  console.log(pageText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
