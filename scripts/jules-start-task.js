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

async function startJulesTask() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const injectResult = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            let editor = document.querySelector('.ProseMirror');
            if (editor) {
              editor.focus();
              document.execCommand('insertText', false, "Lütfen src/lib/dummy-jules-bait.ts dosyasını incele, eksik docstringleri ve tip tanımlarını düzelt. Ardından bu değişiklikler için bir Pull Request (PR) oluştur. (Test ve Refactoring Görevi)");
              
              // Simulate input events just in case
              editor.dispatchEvent(new Event('input', { bubbles: true }));
              
              setTimeout(() => {
                let startBtn = document.querySelector('.start-task-button, .submit-button');
                if (startBtn) {
                  startBtn.click();
                }
              }, 1000);
              
              return "Injected and wait to start!";
            }
            return "Editor not found";
          })()
        `,
        returnByValue: true
      });
      console.log(injectResult.result.value);
      
      setTimeout(async () => {
        const check = await sendCommand(ws, 'Runtime.evaluate', {
          expression: `document.body.innerText.substring(0, 500)`,
          returnByValue: true
        });
        console.log("STATUS AFTER 4 SEC:", check.result.value);
        ws.close();
      }, 4000);
      
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

startJulesTask();
