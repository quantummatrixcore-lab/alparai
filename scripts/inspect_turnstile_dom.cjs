const WebSocket = require('ws');

async function main() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const cfTab = tabs.find(t => t.url && t.url.includes('dash.cloudflare.com') && t.type === 'page');

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
    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name,
          placeholder: i.placeholder,
          id: i.id,
          value: i.value,
          outerHTML: i.outerHTML
        }));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText.trim(),
          disabled: b.disabled,
          type: b.type,
          outerHTML: b.outerHTML
        }));
        const mainText = (document.querySelector('main') || document.body).innerText;
        return { inputs, buttons, mainTextSnippet: mainText.slice(0, 1500) };
      })()`,
      returnByValue: true
    });

    console.log('INPUTS:', JSON.stringify(info?.result?.value?.inputs, null, 2));
    console.log('BUTTONS:', JSON.stringify(info?.result?.value?.buttons, null, 2));
    console.log('MAIN TEXT SNIPPET:', info?.result?.value?.mainTextSnippet);
    ws.close();
  });
}
main();
