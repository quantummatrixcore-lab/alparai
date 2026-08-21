const http = require("http");
const WebSocket = require("ws");

http.get("http://localhost:9222/json/list", (res) => {
  let body = "";
  res.on("data", (c) => (body += c));
  res.on("end", () => {
    const tabs = JSON.parse(body);
    const adminTab = tabs.find((t) => t.url.includes("alparai.com")) || tabs[0];
    const ws = new WebSocket(adminTab.webSocketDebuggerUrl);

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: {
            expression: 'document.body ? document.body.innerText : "NO_BODY"',
            returnByValue: true,
          },
        }),
      );
    });

    ws.on("message", (data) => {
      const msg = JSON.parse(data);
      if (msg.id === 1) {
        console.log("--- BODY TEXT START ---");
        console.log(msg.result.result.value);
        console.log("--- BODY TEXT END ---");
        ws.close();
      }
    });
  });
});
