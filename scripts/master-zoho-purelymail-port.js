import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'zoho' });

  const script = `
    (function() {
      const all = Array.from(document.querySelectorAll('*'));
      const appPassHeader = all.find(e => e.innerText && e.innerText.trim() === 'Uygulamaya Özel Parolalar');
      if (!appPassHeader) return { error: 'header not found' };

      const parentBox = appPassHeader.closest('.box') || appPassHeader.parentElement.parentElement;
      const buttons = Array.from(parentBox.querySelectorAll('button, a, div, span, input')).map(e => ({
        tag: e.tagName,
        text: e.innerText?.trim() || e.value || '',
        id: e.id,
        class: e.className
      }));

      return {
        headerText: appPassHeader.innerText,
        boxText: parentBox.innerText,
        buttons: buttons.filter(b => b.text.length > 0 && b.text.length < 50)
      };
    })()
  `;

  const res = await agent.send('Runtime.evaluate', { expression: script, returnByValue: true });
  console.log('App Pass Box Result:', JSON.stringify(res.result?.value, null, 2));

  await agent.disconnect();
}

run().catch(console.error);
