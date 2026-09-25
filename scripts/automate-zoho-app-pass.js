import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  // 1. Click "Send Code"
  console.log('Clicking "Send Code" (Kod Gönder)...');
  const clickSendCode = `
    (function() {
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], div, a'));
      const btn = btns.find(b => b.innerText.toLowerCase().includes('send code') || b.innerText.toLowerCase().includes('kod gönder'));
      if (btn) {
        btn.click();
        return 'clicked_send_code';
      }
      return 'send_code_not_found';
    })()
  `;
  const sendRes = await agent.send('Runtime.evaluate', { expression: clickSendCode, returnByValue: true });
  console.log('Send Code result:', sendRes.result?.value);

  await new Promise(r => setTimeout(r, 4000));

  // 2. Open inbox to get OTP
  console.log('Navigating to Zoho Mail inbox to retrieve OTP...');
  await agent.send('Page.navigate', { url: 'https://mail.zoho.eu/zm/#mail/folder/inbox' });
  await new Promise(r => setTimeout(r, 5000));

  const inboxText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== INBOX TEXT ===');
  console.log(inboxText.result?.value.slice(0, 1500));

  await agent.disconnect();
}

run().catch(console.error);
