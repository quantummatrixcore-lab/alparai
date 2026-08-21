const http = require("http");
const WebSocket = require("ws");

http
  .get("http://localhost:9222/json/list", (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      try {
        const tabs = JSON.parse(body);
        const claudeTab = tabs.find((t) => t.url.includes("claude.ai"));
        if (!claudeTab || !claudeTab.webSocketDebuggerUrl) {
          console.error("Claude tab not found");
          return;
        }

        const ws = new WebSocket(claudeTab.webSocketDebuggerUrl);

        ws.on("open", () => {
          ws.send(
            JSON.stringify({
              id: 1,
              method: "Runtime.evaluate",
              params: {
                expression: `(() => {
              const main = document.querySelector('main') || document.body;
              return main.innerText;
            })()`,
                returnByValue: true,
              },
            }),
          );
        });

        ws.on("message", (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.id === 1 && response.result && response.result.result) {
              const txt = response.result.result.value;
              console.log(txt.slice(-1500));
            }
          } catch (e) {
            console.error(e);
          }
          ws.close();
        });
      } catch (e) {
        console.error(e);
      }
    });
  })
  .on("error", (err) => console.error(err));
