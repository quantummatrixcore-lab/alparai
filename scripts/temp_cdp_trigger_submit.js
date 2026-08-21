const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

ws.on("open", async () => {
  console.log("Connected to CDP");

  // Focus ProseMirror
  ws.send(
    JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: `(() => {
        const ce = document.querySelector('div.ProseMirror');
        if (ce) {
          ce.focus();
          // Select all and re-insert space at the end to trigger ProseMirror state change
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(ce);
          range.collapse(false); // move cursor to end
          sel.removeAllRanges();
          sel.addRange(range);
          return true;
        }
        return false;
      })()`,
        returnByValue: true,
      },
    }),
  );
});

let step = 0;
ws.on("message", (data) => {
  const res = JSON.parse(data.toString());
  step++;

  if (step === 1) {
    console.log("ProseMirror focused:", res);

    // Send Enter key down & up via CDP Input domain
    ws.send(
      JSON.stringify({
        id: 2,
        method: "Input.dispatchKeyEvent",
        params: {
          type: "keyDown",
          key: "Enter",
          code: "Enter",
          windowsVirtualKeyCode: 13,
          nativeVirtualKeyCode: 13,
          text: "\r",
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
          windowsVirtualKeyCode: 13,
          nativeVirtualKeyCode: 13,
        },
      }),
    );

    // Also click Submit button if present
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          id: 4,
          method: "Runtime.evaluate",
          params: {
            expression: `(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const submitBtn = btns.find(b => b.innerText.trim() === 'Submit' || b.getAttribute('aria-label') === 'Send');
            if (submitBtn) {
              submitBtn.click();
              return 'Clicked submit button!';
            }
            return 'No submit button';
          })()`,
            returnByValue: true,
          },
        }),
      );
    }, 200);

    setTimeout(() => {
      ws.close();
    }, 1000);
  } else if (step > 1) {
    console.log("Response:", res);
  }
});
