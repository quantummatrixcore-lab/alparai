const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const script = `
  (() => {
    const elements = Array.from(document.querySelectorAll('.font-claude-message, .prose'));
    if (elements.length > 0) {
      return elements[elements.length - 1].innerText;
    }
    return 'Could not find Claude message. Fallback: ' + document.body.innerText.slice(-1500);
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
