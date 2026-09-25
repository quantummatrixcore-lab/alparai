/**
 * scripts/toggle_proxy_alparai.cjs
 * Toggles Cloudflare Proxy (Orange Cloud) for alparai.com and www.alparai.com.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

ws.on('open', async () => {
  console.log('--- STEP 1: Enable Proxy on alparai.com ---');
  
  const step1 = `(() => {
    // Check if edit form for alparai.com is already open
    const switchBtn = document.querySelector('button[role="switch"][aria-label="Proxy status"]');
    if (switchBtn && switchBtn.getAttribute('aria-checked') === 'false') {
      switchBtn.click();
      return { action: 'clicked_switch', checked: switchBtn.getAttribute('aria-checked') };
    }
    return { action: 'none', state: switchBtn ? switchBtn.getAttribute('aria-checked') : 'no_switch' };
  })()`;

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: step1, returnByValue: true } }));
  await sleep(1000);

  const save1 = `(() => {
    const saveBtn = Array.from(document.querySelectorAll('button[type="submit"], button')).find(b => b.innerText.trim() === 'Save');
    if (saveBtn) {
      saveBtn.click();
      return { saved: true };
    }
    return { saved: false };
  })()`;

  ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: save1, returnByValue: true } }));
  console.log('Saved alparai.com. Waiting 3s for API...');
  await sleep(3500);

  console.log('--- STEP 2: Enable Proxy on www.alparai.com ---');
  const editWww = `(() => {
    const btn = document.querySelector('button[aria-label="Edit A record with name www.alparai.com"]');
    if (btn) {
      btn.click();
      return { clickedEditWww: true };
    }
    return { clickedEditWww: false };
  })()`;

  ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: editWww, returnByValue: true } }));
  await sleep(1500);

  const toggleWww = `(() => {
    const switchBtn = document.querySelector('button[role="switch"][aria-label="Proxy status"]');
    if (switchBtn && switchBtn.getAttribute('aria-checked') === 'false') {
      switchBtn.click();
      return { toggledWww: true };
    }
    return { toggledWww: false, current: switchBtn ? switchBtn.getAttribute('aria-checked') : 'missing' };
  })()`;

  ws.send(JSON.stringify({ id: 4, method: 'Runtime.evaluate', params: { expression: toggleWww, returnByValue: true } }));
  await sleep(1000);

  const saveWww = `(() => {
    const saveBtn = Array.from(document.querySelectorAll('button[type="submit"], button')).find(b => b.innerText.trim() === 'Save');
    if (saveBtn) {
      saveBtn.click();
      return { savedWww: true };
    }
    return { savedWww: false };
  })()`;

  ws.send(JSON.stringify({ id: 5, method: 'Runtime.evaluate', params: { expression: saveWww, returnByValue: true } }));
  console.log('Saved www.alparai.com. Waiting 3s for API...');
  await sleep(3500);

  // Verification step
  const verifyScript = `(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr, [role="row"]')).map(r => r.innerText.trim().replace(/\\n+/g, ' | '));
    const alparRows = rows.filter(r => r.includes('45.143.4.92') || r.includes('alparai.com'));
    return {
      alparRows
    };
  })()`;

  ws.send(JSON.stringify({ id: 6, method: 'Runtime.evaluate', params: { expression: verifyScript, returnByValue: true } }));
});

ws.on('message', (d) => {
  const res = JSON.parse(d);
  if (res.id === 6) {
    console.log('--- PROXY ACTIVATION RESULT ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
