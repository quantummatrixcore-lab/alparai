const fs = require('fs');

async function run() {
  const wsUrl = 'ws://127.0.0.1:9222/devtools/page/E2E000B258D684EC21370E3218CF6EB3';
  const ws = new WebSocket(wsUrl);
  let msgId = 1;

  const sendCommand = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const listener = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', listener);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', listener);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.addEventListener('open', r));

  console.log('Clicking Profil link...');
  await sendCommand('Runtime.evaluate', { 
    expression: "document.querySelector('a[href=\"/User/Profile\"]').click()" 
  });

  console.log('Waiting for load...');
  await new Promise(r => setTimeout(r, 5000));

  const nav = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL is:', nav.result.value);

  const extract = await sendCommand('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      Array.from(document.querySelectorAll('input, select, textarea')).map(i => {
        let label = i.labels ? Array.from(i.labels).map(l=>l.innerText).join(' ') : (i.placeholder || i.name || i.id);
        if (!label) {
          const parentLabel = i.closest('label');
          if (parentLabel) label = parentLabel.innerText;
        }
        return label + ': ' + i.value;
      })
    `
  });
  console.log('Inputs found:');
  console.log(extract.result.value);

  ws.close();
}

run().catch(console.error);
