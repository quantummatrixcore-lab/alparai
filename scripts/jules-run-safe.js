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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runJulesSafely() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      console.log('Step 1: Click "New Task"');
      await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          let btn = document.querySelector('.new-task-button');
          if (btn) btn.click();
        `
      });
      
      await sleep(1500);
      
      console.log('Step 2: Inject text and click Start');
      await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          let editor = document.querySelector('.ProseMirror');
          if (editor) {
            editor.focus();
            document.execCommand('insertText', false, "Inspect src/lib/dummy-jules-bait.ts and recent code changes for doc or type improvements and open a Pull Request.");
            
            setTimeout(() => {
              let startBtn = document.querySelector('.start-task-button');
              if (startBtn) startBtn.click();
            }, 500);
          }
        `
      });
      
      await sleep(2000);
      
      console.log('Step 3: Checking if started...');
      const check = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `document.body.innerText.substring(0, 1000)`,
        returnByValue: true
      });
      
      console.log(check.result.value);
      
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

runJulesSafely();
