const ws = require('ws');

async function getPurelyMailTab() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('purelymail'));
  return tab;
}

async function evaluate(code) {
  const tab = await getPurelyMailTab();
  if (!tab) {
    console.log('NO_TAB');
    return;
  }
  return new Promise((resolve, reject) => {
    const socket = new ws(tab.webSocketDebuggerUrl);
    socket.on('open', () => {
      socket.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: code, returnByValue: true }
      }));
    });
    socket.on('message', (msg) => {
      const resp = JSON.parse(msg);
      if (resp.id === 1) {
        socket.close();
        resolve(resp.result ? resp.result.result : null);
      }
    });
    socket.on('error', reject);
  });
}

async function main() {
  const action = process.argv[2] || 'status';
  if (action === 'status') {
    const res = await evaluate('document.title + " --- " + window.location.href');
    console.log('PAGE:', res ? res.value : 'NULL');
  } else if (action === 'eval') {
    const code = process.argv[3];
    const res = await evaluate(code);
    console.log('RESULT:', res ? res.value : 'NULL');
  }
}

main().catch(console.error);
