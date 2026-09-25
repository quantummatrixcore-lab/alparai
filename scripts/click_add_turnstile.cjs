const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const cfTab = tabs.find(t => t.url && t.url.includes('dash.cloudflare.com') && t.type === 'page');

  if (!cfTab) return;
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
    console.log('--- Navigating to turnstile/add ---');
    await send('Page.navigate', { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/turnstile/add' });
    await sleep(4000);

    console.log('--- Inspecting inputs on turnstile/add ---');
    const pageData = await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name,
          placeholder: i.placeholder,
          id: i.id,
          role: i.getAttribute('role'),
          class: i.className,
          value: i.value
        }));
        return {
          url: window.location.href,
          inputs,
          textSnippet: (document.querySelector('main') || document.body).innerText.slice(0, 1500)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(pageData?.result?.value, null, 2));
    ws.close();
  });
}

main();
