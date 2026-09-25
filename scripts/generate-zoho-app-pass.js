import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  console.log('--- GENERATING ZOHO APP PASSWORD FOR PURELYMAIL PORT ---');

  // 1. Click "Yeni Parola Üret" or "Generate New Password"
  const clickGen = `
    (function() {
      const btns = Array.from(document.querySelectorAll('button, div, a, span'));
      const btn = btns.find(b => b.innerText.toLowerCase().includes('yeni parola') || b.innerText.toLowerCase().includes('generate new'));
      if (btn) {
        btn.click();
        return 'clicked_generate_button';
      }
      return 'generate_btn_not_found';
    })()
  `;
  const genRes = await agent.send('Runtime.evaluate', { expression: clickGen, returnByValue: true });
  console.log('Click generate button result:', genRes.result?.value);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Type app name "PurelymailPort" and click Generate
  const fillAppName = `
    (function() {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => i.type === 'text' || i.name?.includes('app') || i.name?.includes('name') || i.id?.includes('app'));
      if (nameInput) {
        nameInput.value = 'PurelymailPort';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"], div, a'));
      const submitBtn = btns.find(b => b.innerText.trim().toLowerCase() === 'üret' || b.innerText.trim().toLowerCase() === 'generate' || b.innerText.trim().toLowerCase() === 'oluştur');
      if (submitBtn) {
        submitBtn.click();
        return 'clicked_create_password_submit';
      }
      return 'submit_btn_not_found';
    })()
  `;

  const fillRes = await agent.send('Runtime.evaluate', { expression: fillAppName, returnByValue: true });
  console.log('Fill app name result:', fillRes.result?.value);
  await new Promise(r => setTimeout(r, 3000));

  // 3. Extract the generated password from page DOM
  const extractPasswordScript = `
    (function() {
      const body = document.body.innerText;
      const html = document.body.innerHTML;
      // App passwords in Zoho are usually 16-char spaced or continuous strings like abcd efgh ijkl mnop
      const matches = body.match(/[a-z0-9]{4}\\s+[a-z0-9]{4}\\s+[a-z0-9]{4}\\s+[a-z0-9]{4}/gi) || body.match(/[a-z0-9]{16}/gi);
      return {
        bodySnippet: body.slice(0, 1500),
        extractedPasswordMatches: matches
      };
    })()
  `;

  const extRes = await agent.send('Runtime.evaluate', { expression: extractPasswordScript, returnByValue: true });
  console.log('=== EXTRACTED ZOHO APP PASSWORD RESULT ===');
  console.log(JSON.stringify(extRes.result?.value, null, 2));

  await agent.disconnect();
}

run().catch(console.error);
