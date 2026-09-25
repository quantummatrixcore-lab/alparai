/**
 * scripts/auto_create_turnstile_widget.cjs
 * Creates Turnstile widget for alparai.com using real key events and clicks.
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const cfTab = tabs.find(t => t.url && t.url.includes('dash.cloudflare.com') && t.type === 'page');

  if (!cfTab) {
    console.error('No active Cloudflare tab found!');
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

    await sleep(1000);

    console.log('--- Step 2: Focus Hostname Combobox Input ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const hostInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.toLowerCase().includes('hostname')) || document.querySelector('[role="combobox"]');
        if (hostInput) {
          hostInput.focus();
          hostInput.click();
        }
      })()`
    });

    await sleep(500);

    console.log('--- Step 3: Type alparai.com character by character ---');
    for (const char of 'alparai.com') {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', text: char, key: char });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', text: char, key: char });
      await sleep(50);
    }

    await sleep(1000);

    console.log('--- Step 4: Check for dropdown items or press Enter ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        // Try clicking any option containing alparai.com
        const option = Array.from(document.querySelectorAll('div, li, span, button')).find(el => el.innerText && el.innerText.trim() === 'alparai.com' && el.tagName !== 'BODY');
        if (option) {
          option.click();
          return 'Clicked option';
        }
        return 'No option element found';
      })()`
    });

    await send('Input.dispatchKeyEvent', { type: 'keyDown', text: '\r', unprefixedKeyIdentifier: 'Enter', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', text: '\r', unprefixedKeyIdentifier: 'Enter', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });

    await sleep(1500);

    console.log('--- Step 5: Check hostnames configured count ---');
    const status = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        const configuredMatch = text.match(/configured\\s+(\\d+)\\s+out\\s+of/i);
        const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create');
        return {
          configuredText: configuredMatch ? configuredMatch[0] : null,
          createDisabled: createBtn ? createBtn.disabled : null
        };
      })()`,
      returnByValue: true
    });

    console.log('STATUS:', JSON.stringify(status?.result?.value, null, 2));

    if (status?.result?.value?.createDisabled === false || status?.result?.value?.configuredText?.includes('1 out of')) {
      console.log('--- Step 6: Click Submit (Create) ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create');
          if (createBtn) createBtn.click();
        })()`
      });

      await sleep(5000);

      const keys = await send('Runtime.evaluate', {
        expression: `(() => {
          const text = document.body.innerText || '';
          const siteKeyMatch = text.match(/0x4[0-9a-zA-Z_]{15,}/g);
          return {
            url: window.location.href,
            keysFound: siteKeyMatch,
            snippet: text.slice(0, 3000)
          };
        })()`,
        returnByValue: true
      });

      console.log('KEYS RESULT:', JSON.stringify(keys?.result?.value, null, 2));
    }

    ws.close();
  });
}

main().catch(console.error);
