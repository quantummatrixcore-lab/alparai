const WebSocket = require('ws');
const fs = require('fs');

async function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const listener = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === id) {
        ws.removeListener('message', listener);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.on('message', listener);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function runTask(tabId, url) {
  return new Promise((resolve, reject) => {
    const wsUrl = `ws://localhost:9222/devtools/page/${tabId}`;
    console.log(`Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', async () => {
      try {
        console.log(`Navigating to ${url}...`);
        await sendCommand(ws, 'Page.enable');
        await sendCommand(ws, 'Page.navigate', { url });
        
        // Wait for load
        await new Promise(r => setTimeout(r, 6000));
        
        console.log('Extracting text...');
        const result = await sendCommand(ws, 'Runtime.evaluate', {
          expression: 'document.body.innerText',
          returnByValue: true
        });
        
        ws.close();
        resolve(result.result.value);
      } catch (err) {
        ws.close();
        reject(err);
      }
    });
    
    ws.on('error', reject);
  });
}

async function main() {
  try {
    console.log('Starting Faz 1...');
    const text1 = await runTask('20D1BDFEBFCF7C84F215A790A9B205FF', 'https://www.linkedin.com/in/erc%C3%BCment-erden/');
    fs.writeFileSync('LinkedIn_Optimizasyon.md', '# FAZ 1: Kişisel Profil (Ercüment Erden)\n\n## Ham Profil Verisi\n' + text1.substring(0, 2000) + '\n\n');
    console.log('Faz 1 complete.');
    
    console.log('Starting Faz 2...');
    const text2 = await runTask('FF3DAE557B68B120EBBE03C665351CEB', 'https://www.linkedin.com/company/135125061/admin/dashboard/');
    fs.appendFileSync('LinkedIn_Optimizasyon.md', '# FAZ 2: Şirket Profili (ALPAR AI)\n\n## Ham Profil Verisi\n' + text2.substring(0, 2000) + '\n\n');
    console.log('Faz 2 complete.');
  } catch (err) {
    console.error(err);
  }
}

main();
