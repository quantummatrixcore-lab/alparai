import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });
  
  // Type alparai.com into the input and submit
  const submitScript = `
    (function() {
      const inputs = Array.from(document.querySelectorAll('input'));
      console.log('Inputs found:', inputs.map(i => i.outerHTML));
      const input = inputs.find(i => i.type !== 'hidden' && i.type !== 'submit' && i.type !== 'button');
      if (input) {
        input.value = 'alparai.com';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        const form = input.form || input.closest('form');
        if (form) {
          form.submit();
          return 'form_submitted_directly';
        }
      }
      return 'input_not_found';
    })()
  `;
  const res = await agent.send('Runtime.evaluate', { expression: submitScript, returnByValue: true });
  console.log('Submit result:', res.result?.value);
  await new Promise(r => setTimeout(r, 4000));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== PAGE TEXT AFTER FORM SUBMIT ===');
  console.log(pageText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
