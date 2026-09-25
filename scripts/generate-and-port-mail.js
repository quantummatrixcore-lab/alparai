import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  console.log('--- TARGETED ZOHO APP PASSWORD MODAL INTERACTION ---');

  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  // 1. Open App Password modal
  const openModalScript = `
    (function() {
      const els = Array.from(document.querySelectorAll('.addnew, #generate_app_pass, button, div, span'));
      const btn = els.find(e => e.innerText.includes('Yeni Parola Oluştur') || e.innerText.includes('Yeni Parola Üret'));
      if (btn) {
        btn.click();
        return 'modal_opened';
      }
      return 'btn_not_found';
    })()
  `;
  const openRes = await agent.send('Runtime.evaluate', { expression: openModalScript, returnByValue: true });
  console.log('Open modal result:', openRes.result?.value);
  await new Promise(r => setTimeout(r, 1500));

  // 2. Find modal input and fill app name "PurelymailPort"
  const fillModalScript = `
    (function() {
      const inputs = Array.from(document.querySelectorAll('input'));
      const visibleInput = inputs.find(i => i.offsetWidth > 0 || i.offsetHeight > 0 || i.type === 'text');
      if (visibleInput) {
        visibleInput.value = 'PurelymailPort';
        visibleInput.dispatchEvent(new Event('input', { bubbles: true }));
        visibleInput.dispatchEvent(new Event('change', { bubbles: true }));
        return { filled: true, inputId: visibleInput.id, inputName: visibleInput.name };
      }
      return { filled: false, allInputs: inputs.map(i => ({ id: i.id, name: i.name, type: i.type })) };
    })()
  `;
  const fillRes = await agent.send('Runtime.evaluate', { expression: fillModalScript, returnByValue: true });
  console.log('Fill modal result:', JSON.stringify(fillRes.result?.value, null, 2));

  // 3. Click Üret / Generate button in modal
  const clickSubmitScript = `
    (function() {
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"], div, a, span'));
      const generateBtn = btns.find(b => b.innerText.trim() === 'Üret' || b.innerText.trim() === 'Generate' || b.innerText.trim() === 'Oluştur');
      if (generateBtn) {
        generateBtn.click();
        return { clicked: true, text: generateBtn.innerText };
      }
      return { clicked: false };
    })()
  `;
  const submitRes = await agent.send('Runtime.evaluate', { expression: clickSubmitScript, returnByValue: true });
  console.log('Click Generate result:', JSON.stringify(submitRes.result?.value, null, 2));

  await new Promise(r => setTimeout(r, 3000));

  // 4. Extract generated password popup text
  const extractScript = `
    (function() {
      const bodyText = document.body.innerText;
      const htmlText = document.body.innerHTML;
      const matches = bodyText.match(/[a-z0-9]{4}\\s+[a-z0-9]{4}\\s+[a-z0-9]{4}\\s+[a-z0-9]{4}/gi) || bodyText.match(/[a-z0-9]{16}/gi);
      return { bodyText: bodyText.slice(0, 1500), matches };
    })()
  `;

  const extRes = await agent.send('Runtime.evaluate', { expression: extractScript, returnByValue: true });
  console.log('=== EXTRACTED POPUP TEXT ===');
  console.log(JSON.stringify(extRes.result?.value, null, 2));

  await agent.disconnect();
}

run().catch(console.error);
