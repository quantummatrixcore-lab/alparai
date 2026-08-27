const WebSocket = require('ws');

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

async function runJules() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      console.log('Selecting repo and injecting prompt...');
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            try {
              // 1. Find and click the Alparai repo
              let rows = Array.from(document.querySelectorAll('.source-row'));
              let repo = rows.find(r => r.innerText.toLowerCase().includes('alparai'));
              if (repo) {
                repo.click();
              }
              
              // 2. Inject text into ProseMirror
              let editor = document.querySelector('.ProseMirror');
              if (editor) {
                editor.focus();
                document.execCommand('insertText', false, "Inspect src/lib/dummy-jules-bait.ts and recent code changes for doc or type improvements and open a Pull Request.");
              }
              
              // 3. Click Start Task button
              setTimeout(() => {
                let startBtn = document.querySelector('.start-task-button');
                if (startBtn) {
                  startBtn.click();
                }
              }, 1000);
              
              return "Injected and clicked!";
            } catch (e) {
              return e.toString();
            }
          })()
        `,
        returnByValue: true
      });
      
      console.log(result.result.value);
      
      setTimeout(() => ws.close(), 3000);
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

runJules();
