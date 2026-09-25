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
    console.log('Navigating to Turnstile Widgets main list...');
    await send('Page.navigate', { url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/turnstile' });
    await sleep(5000);

    const listData = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = (document.querySelector('main') || document.body).innerText || '';
        const siteKeys = text.match(/0x4[0-9a-zA-Z_]{15,}/g);
        const rows = Array.from(document.querySelectorAll('tr, [role="row"], div')).map(el => el.innerText.trim()).filter(t => t.includes('ALPAR') || t.includes('alparai'));
        return {
          url: window.location.href,
          siteKeys,
          rows: rows.slice(0, 10),
          fullSnippet: text.slice(0, 3000)
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(listData?.result?.value, null, 2));
    ws.close();
  });
}

main();
