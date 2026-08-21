const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const script = `
  (() => {
    const msgs = Array.from(document.querySelectorAll('.font-claude-message, [data-is-streaming="false"], .prose'));
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].innerText : '';
    const pm = document.querySelector('div.ProseMirror');
    const inputVal = pm ? pm.innerText : '';
    return { lastMsg, inputVal };
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
      console.log("LAST CLAUDE MSG:\n", response.result.result.value.lastMsg);
      console.log("\nCURRENT INPUT:\n", response.result.result.value.inputVal);
    }
  } catch (e) {
    console.error(e);
  }
  ws.close();
});
