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

async function interactJules() {
  const wsUrl = `ws://localhost:9222/devtools/page/47571028760470871EBE42A35A4F8C9D`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      console.log('Clicking new task button...');
      await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            let btn = document.querySelector('.new-task-button');
            if (btn) {
              btn.click();
              return 'Clicked!';
            }
            return 'Not found';
          })()
        `
      });
      
      console.log('Waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
      
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (function() {
            return {
              textareas: Array.from(document.querySelectorAll('textarea')).map(t => ({ placeholder: t.placeholder, class: t.className })),
              inputs: Array.from(document.querySelectorAll('input')).map(i => ({ placeholder: i.placeholder, class: i.className })),
              buttons: Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText, class: b.className })),
              html: document.body.innerText.substring(0, 1000)
            }
          })()
        `,
        returnByValue: true
      });
      
      console.log(JSON.stringify(result.result.value, null, 2));
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

interactJules();
