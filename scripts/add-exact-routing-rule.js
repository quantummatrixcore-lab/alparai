import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });

  console.log('--- CONFIGURING CATCH-ALL ROUTING FOR ALPARAI.COM ---');
  await agent.send('Page.navigate', { url: 'https://purelymail.com/manage/routing' });
  await new Promise(r => setTimeout(r, 2500));

  const catchallScript = `
    (async function() {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const addBtn = btns.find(b => b.innerText.toLowerCase().includes('add new rule') || b.innerText.toLowerCase().includes('add rule'));
      if (addBtn) addBtn.click();

      await new Promise(r => setTimeout(r, 1000));

      const selects = Array.from(document.querySelectorAll('select'));
      // Find match type select and pick catchall option
      const matchSelect = selects.find(s => Array.from(s.options).some(o => o.text.includes('catchall')));
      if (matchSelect) {
        const catchOpt = Array.from(matchSelect.options).find(o => o.text.includes('catchall'));
        if (catchOpt) {
          matchSelect.value = catchOpt.value;
          matchSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      const inputs = Array.from(document.querySelectorAll('input'));
      const targetInput = inputs.find(i => i.name === 'target' || i.name === 'destination' || i.name === 'to' || i.type === 'text');
      if (targetInput) {
        targetInput.value = 'ercument@alparai.com';
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const saveBtn = Array.from(document.querySelectorAll('button, input[type="submit"]')).find(b => b.innerText.trim().toLowerCase().includes('save') || b.value?.toLowerCase().includes('save'));
      if (saveBtn) {
        saveBtn.click();
        return 'catchall_configured';
      }

      return 'save_not_found';
    })()
  `;

  const res = await agent.send('Runtime.evaluate', { expression: catchallScript, awaitPromise: true, returnByValue: true });
  console.log('Catchall result:', res.result?.value);

  await new Promise(r => setTimeout(r, 3500));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== ROUTING PAGE TEXT AFTER CATCHALL ===');
  console.log(pageText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
