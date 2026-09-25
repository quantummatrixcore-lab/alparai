/**
 * scripts/submit_turnstile_widget.cjs
 * Fills in the Turnstile widget creation form for alparai.com and submits.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  console.log('--- Filling Turnstile Form ---');

  const fillScript = `(() => {
    // 1. Widget Name
    const nameInput = document.querySelector('input[name="name"]') || document.querySelector('input[placeholder*="name"]');
    if (nameInput) {
      nameInput.focus();
      nameInput.value = 'ALPAR AI Platform';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 2. Hostname Input
    const hostInput = document.querySelector('input[placeholder*="hostname"]') || document.querySelector('input[placeholder*="Search or enter"]');
    if (hostInput) {
      hostInput.focus();
      hostInput.value = 'alparai.com';
      hostInput.dispatchEvent(new Event('input', { bubbles: true }));
      hostInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Simulate Enter key on hostname input
      hostInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      hostInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    }

    return {
      nameVal: nameInput ? nameInput.value : null,
      hostVal: hostInput ? hostInput.value : null
    };
  })()`;

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: fillScript, returnByValue: true } }));
  await sleep(1500);

  // Check if dropdown or add button appeared for hostname
  const confirmHost = `(() => {
    // Check if there is an item in the dropdown or list to click
    const menuItems = Array.from(document.querySelectorAll('[role="option"], [role="listbox"] div, li')).filter(el => {
      const text = el.innerText.trim();
      return text.includes('alparai.com');
    });

    if (menuItems.length > 0) {
      menuItems[0].click();
      return { clickedMenuItem: true, text: menuItems[0].innerText.trim() };
    }

    return { clickedMenuItem: false };
  })()`;

  ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: confirmHost, returnByValue: true } }));
  await sleep(1000);

  // Click Create button
  console.log('Clicking Create button...');
  const clickCreate = `(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const createBtn = btns.find(b => b.innerText.trim() === 'Create');
    if (createBtn && !createBtn.disabled) {
      createBtn.click();
      return { clickedCreate: true };
    }
    return { clickedCreate: false, disabled: createBtn ? createBtn.disabled : null };
  })()`;

  ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: clickCreate, returnByValue: true } }));
  await sleep(3500);

  // Check result page for Site Key and Secret Key
  const extractKeys = `(() => {
    const text = (document.querySelector('main') || document.body).innerText || '';
    const siteKeyMatch = text.match(/Site Key[\\s\\n]+([0-9a-zA-Z_xX-]{20,})/i) || text.match(/(0x4[0-9a-zA-Z_]{15,})/);
    const secretKeyMatch = text.match(/Secret Key[\\s\\n]+([0-9a-zA-Z_xX-]{20,})/i) || text.match(/(0x4[0-9a-zA-Z_]{20,})/);

    // Look for code/copy blocks
    const codeBlocks = Array.from(document.querySelectorAll('code, pre, input[readonly]')).map(c => c.value || c.innerText.trim());

    return {
      siteKey: siteKeyMatch ? siteKeyMatch[1] : null,
      secretKey: secretKeyMatch ? secretKeyMatch[1] : null,
      codeBlocks: codeBlocks.filter(Boolean),
      sampleText: text.slice(0, 2500)
    };
  })()`;

  ws.send(JSON.stringify({ id: 4, method: 'Runtime.evaluate', params: { expression: extractKeys, returnByValue: true } }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 4) {
    console.log('--- CREATION RESULT ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
