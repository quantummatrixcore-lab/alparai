import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  const otpCode = '3105747';
  console.log('Navigating to Zoho App Passwords and submitting OTP:', otpCode);
  await agent.send('Page.navigate', { url: 'https://accounts.zoho.eu/u/h#security/app_passwords' });
  await new Promise(r => setTimeout(r, 2500));

  // Type OTP into input and submit
  const otpScript = `
    (function() {
      const inputs = Array.from(document.querySelectorAll('input'));
      const otpInput = inputs.find(i => i.type === 'text' || i.type === 'number' || i.name?.includes('code') || i.name?.includes('otp') || i.id?.includes('code') || i.placeholder?.includes('code') || i.placeholder?.includes('parola'));
      if (otpInput) {
        otpInput.value = '${otpCode}';
        otpInput.dispatchEvent(new Event('input', { bubbles: true }));
        otpInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button, input[type="submit"], div, a'));
      const verifyBtn = btns.find(b => b.innerText.toLowerCase().includes('verify') || b.innerText.toLowerCase().includes('doğrula') || b.innerText.toLowerCase().includes('devam'));
      if (verifyBtn) {
        verifyBtn.click();
        return 'otp_submitted';
      }
      return 'verify_btn_not_found';
    })()
  `;

  const otpRes = await agent.send('Runtime.evaluate', { expression: otpScript, returnByValue: true });
  console.log('OTP submit result:', otpRes.result?.value);
  await new Promise(r => setTimeout(r, 4000));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== PAGE TEXT AFTER OTP VERIFICATION ===');
  console.log(pageText.result?.value.slice(0, 1500));

  await agent.disconnect();
}

run().catch(console.error);
