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
  // Listen to network requests
  ws.send(JSON.stringify({ id: 1, method: 'Network.enable' }));

  const netReqs = [];
  ws.on('message', (m) => {
    const p = JSON.parse(m);
    if (p.method === 'Network.requestWillBeSent') {
      netReqs.push({ url: p.params.request.url, method: p.params.request.method });
    }
  });

  console.log('Setting select values and triggering input events...');
  const res = await evalJs(`
    (function() {
      const selRecv = document.querySelector('select[data-b="323"]') || document.querySelectorAll('select')[0];
      const selSend = document.querySelector('select[data-b="324"]') || document.querySelectorAll('select')[1];
      
      if (!selRecv || !selSend) return { error: 'selects not found' };

      // Set values to 0
      selRecv.value = '0';
      selRecv.dispatchEvent(new Event('input', { bubbles: true }));
      selRecv.dispatchEvent(new Event('change', { bubbles: true }));

      selSend.value = '0';
      selSend.dispatchEvent(new Event('input', { bubbles: true }));
      selSend.dispatchEvent(new Event('change', { bubbles: true }));

      // Find the button with data-i="7" or the one after select
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.innerText.trim() === 'Save changes' && b.querySelector('script[data-i="7"]'));
      const fallbackBtn = btns.find(b => b.innerText.trim() === 'Save changes');
      const targetBtn = saveBtn || fallbackBtn;

      if (targetBtn) {
        targetBtn.click();
        return { success: true, targetBtnFound: !!targetBtn, isI7: !!saveBtn };
      }
      return { error: 'save button not found' };
    })()
  `);
  console.log('Action result:', res);

  await new Promise(r => setTimeout(r, 3000));
  console.log('Network requests captured:', netReqs);

  // Check state
  const state = await evalJs(`
    (function() {
      const s0 = document.querySelectorAll('select')[0];
      const s1 = document.querySelectorAll('select')[1];
      return {
        s0Val: s0?.value,
        s0Text: s0?.options[s0?.selectedIndex]?.text,
        s1Val: s1?.value,
        s1Text: s1?.options[s1?.selectedIndex]?.text
      };
    })()
  `);
  console.log('Current state:', state);

  // Reload to verify server persistence
  console.log('Reloading page to verify persistence...');
  ws.send(JSON.stringify({ id: 999, method: 'Page.reload' }));
  await new Promise(r => setTimeout(r, 3500));

  const reloaded = await evalJs(`
    (function() {
      const s0 = document.querySelectorAll('select')[0];
      const s1 = document.querySelectorAll('select')[1];
      return {
        s0Val: s0?.value,
        s0Text: s0?.options[s0?.selectedIndex]?.text,
        s1Val: s1?.value,
        s1Text: s1?.options[s1?.selectedIndex]?.text
      };
    })()
  `);
  console.log('Reloaded verified state:', reloaded);

  ws.close();
});
