const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const script = `
  (() => {
    // Try to find the send button. Usually has aria-label="Send Message" or an SVG inside a button.
    const btns = Array.from(document.querySelectorAll('button'));
    let sendBtn = btns.find(b => b.getAttribute('aria-label') === 'Send Message' || (b.innerHTML.includes('svg') && !b.disabled && b.closest('form')));
    
    if (sendBtn) {
      sendBtn.click();
      return "Clicked button: " + sendBtn.outerHTML.slice(0, 100);
    }
    
    // Fallback: try finding a form and calling requestSubmit()
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
      return "Requested form submit";
    }
    
    return "Could not find button or form to submit.";
  })();
`;

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: script,
        returnByValue: true,
      },
    }),
  );
});

ws.on("message", (data) => {
  try {
    const response = JSON.parse(data.toString());
    if (response.id === 1 && response.result && response.result.result) {
      console.log(response.result.result.value);
    }
  } catch (e) {
    console.error(e);
  }
  ws.close();
});
