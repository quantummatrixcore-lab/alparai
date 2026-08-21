const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

async function sendEnter() {
  return new Promise((resolve, reject) => {
    ws.on("open", () => {
      // 1. First attempt: click the send button
      const clickScript = `
        (() => {
          // Find send button by aria-label or SVG or icon
          const btn = document.querySelector('button[aria-label="Send Message"]') || 
                      document.querySelector('button[aria-label*="Send"]') ||
                      document.querySelector('button:has(svg)');
          
          // Or find button near ProseMirror
          const pm = document.querySelector('div.ProseMirror');
          let parent = pm ? pm.closest('fieldset, form, div.relative') : null;
          let sendBtn = parent ? parent.querySelector('button:not([disabled])') : null;

          const targetBtn = btn || sendBtn;
          if (targetBtn) {
            targetBtn.click();
            return 'Clicked button: ' + (targetBtn.ariaLabel || targetBtn.className);
          }
          return 'No send button found';
        })();
      `;

      ws.send(
        JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: {
            expression: clickScript,
            returnByValue: true,
          },
        }),
      );
    });

    ws.on("message", (data) => {
      try {
        const response = JSON.parse(data.toString());
        if (response.id === 1) {
          console.log("Evaluate result:", response.result);
          // 2. Dispatch Enter Key press
          ws.send(
            JSON.stringify({
              id: 2,
              method: "Input.dispatchKeyEvent",
              params: {
                type: "keyDown",
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                windowsVirtualKeyCode: 13,
                nativeVirtualKeyCode: 13,
              },
            }),
          );
          ws.send(
            JSON.stringify({
              id: 3,
              method: "Input.dispatchKeyEvent",
              params: {
                type: "keyUp",
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                windowsVirtualKeyCode: 13,
                nativeVirtualKeyCode: 13,
              },
            }),
          );
          setTimeout(() => {
            ws.close();
            resolve();
          }, 1000);
        }
      } catch (e) {
        console.error(e);
        ws.close();
        reject(e);
      }
    });
  });
}

sendEnter();
