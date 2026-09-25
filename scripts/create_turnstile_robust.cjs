const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const cfTab = tabs.find(t => t.url && t.url.includes('dash.cloudflare.com') && t.type === 'page');

  if (!cfTab) {
    console.error('No Cloudflare tab!');
    process.exit(1);
  }

  const ws = new WebSocket(cfTab.webSocketDebuggerUrl);
  let messageId = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++messageId;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('open', async () => {
    console.log('Navigating to turnstile/add...');
    await send('Page.navigate', { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/turnstile/add' });

    // Poll until input[name="name"] is available
    let attempts = 0;
    let found = false;
    while (attempts < 15) {
      await sleep(1000);
      attempts++;
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const nameInput = document.querySelector('input[name="name"]');
          const hostInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.toLowerCase().includes('hostname')) || document.querySelector('[role="combobox"]');
          const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create');
          return {
            hasName: !!nameInput,
            hasHost: !!hostInput,
            hasCreate: !!createBtn,
            url: window.location.href,
            bodyLen: document.body.innerText.length
          };
        })()`,
        returnByValue: true
      });
      const st = evalRes?.result?.value;
      console.log(`Attempt ${attempts}:`, JSON.stringify(st));
      if (st?.hasName) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.error('Turnstile form not loaded after 15 attempts.');
      ws.close();
      return;
    }

    console.log('--- Step 1: Set Widget Name ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const nameInput = document.querySelector('input[name="name"]');
        if (nameInput) {
          nameInput.focus();
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(nameInput, 'ALPAR AI Platform');
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          nameInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });

    await sleep(500);

    console.log('--- Step 2: Add Hostname alparai.com ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const hostInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.toLowerCase().includes('hostname')) || document.querySelector('[role="combobox"]');
        if (hostInput) {
          hostInput.focus();
          hostInput.click();
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(hostInput, 'alparai.com');
          hostInput.dispatchEvent(new Event('input', { bubbles: true }));
          hostInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });

    await sleep(500);

    // Type Enter key
    await send('Input.dispatchKeyEvent', { type: 'keyDown', text: '\r', unprefixedKeyIdentifier: 'Enter', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', text: '\r', unprefixedKeyIdentifier: 'Enter', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });

    await sleep(1000);

    // Try clicking any option or button with alparai.com
    await send('Runtime.evaluate', {
      expression: `(() => {
        const item = Array.from(document.querySelectorAll('div, li, span, button')).find(el => el.innerText && el.innerText.trim() === 'alparai.com');
        if (item) item.click();
      })()`
    });

    await sleep(1000);

    console.log('--- Step 3: Click Create Button ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create');
        if (createBtn) createBtn.click();
      })()`
    });

    await sleep(5000);

    console.log('--- Step 4: Extract Keys ---');
    const resultData = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = (document.querySelector('main') || document.body).innerText || '';
        const siteKeyMatch = text.match(/0x4[0-9a-zA-Z_]{15,}/g);
        const codeElements = Array.from(document.querySelectorAll('code, pre, input[readonly], [class*="copy"]')).map(e => e.value || e.innerText.trim()).filter(Boolean);
        return {
          url: window.location.href,
          siteKeyMatch,
          codeElements,
          textSnippet: text.slice(0, 3000)
        };
      })()`,
      returnByValue: true
    });

    console.log('FINAL RESULT:', JSON.stringify(resultData?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
