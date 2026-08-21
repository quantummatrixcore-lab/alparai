const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const script = `
  (() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(b => ({
      ariaLabel: b.getAttribute('aria-label'),
      text: b.innerText,
      className: b.className,
      disabled: b.disabled
    }));
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
      console.log(JSON.stringify(response.result.result.value, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
  ws.close();
});
