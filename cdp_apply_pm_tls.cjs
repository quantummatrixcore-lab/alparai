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
  console.log('Changing TLS enforcement settings to No encryption (opportunistic)...');
  
  const changeRes = await evalJs(`
    (function() {
      const selects = Array.from(document.querySelectorAll('select'));
      if (selects.length < 2) return { success: false, reason: 'less_than_2_selects' };

      // Receiving: set to 0 (No encryption)
      selects[0].value = '0';
      selects[0].dispatchEvent(new Event('change', { bubbles: true }));

      // Sending: set to 0 (No encryption)
      selects[1].value = '0';
      selects[1].dispatchEvent(new Event('change', { bubbles: true }));

      // Find Save changes button near the selects
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Save changes');
      if (saveBtn) {
        saveBtn.click();
        return { success: true, clicked: true };
      }
      return { success: false, reason: 'save_button_not_found' };
    })()
  `);
  console.log('Save action result:', changeRes);

  await new Promise(r => setTimeout(r, 3000));

  // Check current URL and text
  const postState = await evalJs(`
    (function() {
      const selects = Array.from(document.querySelectorAll('select'));
      return {
        url: window.location.href,
        select0: selects[0]?.value,
        select0Text: selects[0]?.options[selects[0]?.selectedIndex]?.text,
        select1: selects[1]?.value,
        select1Text: selects[1]?.options[selects[1]?.selectedIndex]?.text,
        alerts: Array.from(document.querySelectorAll('.alert, .toast, [role=alert], p, div')).filter(el => /success|saved|updated|hata|error/i.test(el.innerText)).map(el => el.innerText.trim()).slice(0, 5)
      };
    })()
  `);
  console.log('Post-save state:', JSON.stringify(postState, null, 2));

  // Now reload page to verify persistence from server
  console.log('Reloading page to verify persistence from database...');
  ws.send(JSON.stringify({ id: 999, method: 'Page.reload', params: {} }));
  await new Promise(r => setTimeout(r, 3500));

  const reloadedState = await evalJs(`
    (function() {
      const selects = Array.from(document.querySelectorAll('select'));
      return {
        url: window.location.href,
        select0: selects[0]?.value,
        select0Text: selects[0]?.options[selects[0]?.selectedIndex]?.text,
        select1: selects[1]?.value,
        select1Text: selects[1]?.options[selects[1]?.selectedIndex]?.text
      };
    })()
  `);
  console.log('Reloaded verified state:', JSON.stringify(reloadedState, null, 2));

  ws.close();
});
