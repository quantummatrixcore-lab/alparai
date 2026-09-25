import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  console.log('Navigating to Zoho Security App Passwords...');
  await agent.send('Page.navigate', { url: 'https://accounts.zoho.eu/u/h#security/app_passwords' });
  await new Promise(r => setTimeout(r, 3000));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== ZOHO SECURITY PAGE ===');
  console.log(pageText.result?.value.slice(0, 1500));

  await agent.disconnect();
}

run().catch(console.error);
