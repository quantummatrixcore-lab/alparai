import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'purelymail' });

  const script = `
    (function() {
      const links = Array.from(document.querySelectorAll('a[href="javascript:void 0"]'));
      // links[0] = Purelymail user (source)
      // links[1] = IMAP account (source) -> CLICK THIS
      // links[2] = Purelymail user (dest) -> CLICK THIS
      // links[3] = IMAP account (dest)

      if (links.length >= 3) {
        links[1].click(); // IMAP account (Source)
        links[2].click(); // Purelymail user (Dest)
      }

      const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      const nextBtn = btns.find(b => b.innerText.trim().toLowerCase() === 'next' || b.value?.toLowerCase() === 'next');
      if (nextBtn) {
        nextBtn.click();
        return 'clicked_next_successfully';
      }
      return 'next_btn_not_found';
    })()
  `;

  const res = await agent.send('Runtime.evaluate', { expression: script, returnByValue: true });
  console.log('Result:', res.result?.value);

  await new Promise(r => setTimeout(r, 3500));

  const pageText = await agent.send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true });
  console.log('=== PAGE TEXT AFTER NEXT ===');
  console.log(pageText.result?.value);

  await agent.disconnect();
}

run().catch(console.error);
