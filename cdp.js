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

  console.log('Navigating to /User/Profile...');
  await sendCommand('Page.navigate', { url: 'https://sikayet.kvkk.gov.tr/User/Profile' });

  console.log('Waiting for load...');
  await new Promise(r => setTimeout(r, 5000));

  const nav = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL is:', nav.result.value);

  console.log('Taking screenshot...');
  const ss = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('ss_profile.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved ss_profile.png');

  ws.close();
}

run().catch(console.error);
