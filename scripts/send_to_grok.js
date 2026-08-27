const fs = require("fs");
const http = require("http");

let WebSocket;
try {
  WebSocket = require("ws");
} catch (e) {
  console.error("Lütfen 'npm install ws' komutunu çalıştırın.");
  process.exit(1);
}

const promptText = fs.readFileSync(
  "C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\GROK_MASTER_PROMPT.md",
  "utf8",
);

http.get("http://localhost:9222/json", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const tabs = JSON.parse(data);
    const grokTab = tabs.find((t) => t.url.includes("grok.com"));
    if (!grokTab) {
      console.error("Grok sekmesi bulunamadı!");
      process.exit(1);
    }

    const ws = new WebSocket(grokTab.webSocketDebuggerUrl);
    ws.on("open", async () => {
      console.log("Grok sekmesine CDP ile bağlanıldı.");
      let id = 1;

      const sendCommand = (method, params = {}) => {
        return new Promise((resolve) => {
          const messageId = id++;
          const listener = (msg) => {
            const parsed = JSON.parse(msg);
            if (parsed.id === messageId) {
              ws.off("message", listener);
              resolve(parsed.result);
            }
          };
          ws.on("message", listener);
          ws.send(JSON.stringify({ id: messageId, method, params }));
        });
      };

      await sendCommand("Runtime.evaluate", {
        expression: `
                    const el = document.querySelector('textarea');
                    if (el) el.focus();
                `,
      });
      await new Promise((r) => setTimeout(r, 500));

      await sendCommand("Input.insertText", { text: promptText });
      console.log("Metin yapıştırıldı.");
      await new Promise((r) => setTimeout(r, 1000));

      await sendCommand("Runtime.evaluate", {
        expression: `
                    const buttons = Array.from(document.querySelectorAll('button'));
                    // Grok submit button usually has an svg inside and becomes enabled when text is typed
                    const submitBtn = buttons.find(b => !b.disabled && b.innerHTML.includes('svg'));
                    if (submitBtn) {
                        submitBtn.click();
                        console.log("Submit butonuna tıklandı.");
                    }
                `,
      });

      setTimeout(() => {
        ws.close();
        console.log("İşlem tamamlandı.");
        process.exit(0);
      }, 1000);
    });
  });
});
