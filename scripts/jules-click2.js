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

async function clickNewTask() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            let btn = document.querySelector('.new-task-button');
            if (btn) {
              // trigger a real click
              btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
              btn.click();
              return 'Clicked new task!';
            }
            return 'Not found';
          })()
        `,
        returnByValue: true
      });
      console.log(result.result.value);
      
      setTimeout(async () => {
        const check = await sendCommand(ws, 'Runtime.evaluate', {
          expression: `!!document.querySelector('.ProseMirror')`,
          returnByValue: true
        });
        console.log('ProseMirror exists after click?', check.result.value);
        ws.close();
      }, 2000);
      
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

clickNewTask();
