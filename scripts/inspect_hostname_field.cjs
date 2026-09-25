const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const hostInput = document.querySelector('input[placeholder*="hostname"]') || document.querySelector('input[placeholder*="Search or enter"]');
    const container = hostInput ? hostInput.closest('div') : null;
    
    // Look for sibling buttons or parent elements
    const buttonsNearby = container ? Array.from(container.parentElement.querySelectorAll('button')).map(b => b.innerText.trim()) : [];

    return {
      hostInputOuter: hostInput ? hostInput.outerHTML : null,
      parentHtml: container ? container.parentElement.innerHTML.slice(0, 1500) : null,
      buttonsNearby
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: code, returnByValue: true }
  }));
});

ws.on('message', (d) => {
  console.log(JSON.stringify(JSON.parse(d).result?.result?.value, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
