const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/6C7E134411C702CD8A8774FDA1FC8290');

function evalJs(code) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === id) {
        ws.removeListener('message', handler);
        resolve(parsed.result?.result?.value);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
  });
}

ws.on('open', async () => {
  console.log('Submitting login to manage portal...');
  const res = await evalJs(`
    (function() {
      const emailInput = document.querySelector('#emailInput');
      const passInput = document.querySelector('#passwordInput');
      const submitBtn = Array.from(document.querySelectorAll('button, input[type="submit"]')).find(b => (b.innerText || b.value || '').toLowerCase().includes('login'));
      
      if (emailInput && passInput && submitBtn) {
        emailInput.value = 'ercument.erden@alparai.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        passInput.value = 'AlparAI_2026_045c419b0749!';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        submitBtn.click();
        return { success: true };
      }
      return { success: false, reason: 'elements_not_found' };
    })()
  `);
  console.log('Submit result:', res);

  await new Promise(r => setTimeout(r, 3500));

  const pageState = await evalJs(`
    JSON.stringify({
      url: window.location.href,
      title: document.title,
      text: document.body.innerText.slice(0, 1500)
    })
  `);
  console.log('Page state after login attempt:', JSON.parse(pageState || '{}'));
  ws.close();
});
