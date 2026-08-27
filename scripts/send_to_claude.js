const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const promptText = fs.readFileSync(
  "C:\\Users\\ercum\\.gemini\\antigravity\\brain\\af026298-8e86-4b18-98ec-e90d2c7e9bc4\\opus_briefing.md",
  "utf8",
);

http.get("http://localhost:9222/json", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const tabs = JSON.parse(data);
    const claudeTab = tabs.find((t) => t.url.includes("claude.ai"));
    if (!claudeTab) {
      console.error("Claude sekmesi bulunamadı!");
      process.exit(1);
    }

    const ws = new WebSocket(claudeTab.webSocketDebuggerUrl);
    ws.on("open", async () => {
      console.log("Claude sekmesine CDP ile bağlanıldı:", claudeTab.url);
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

      // Focus contenteditable div
      await sendCommand("Runtime.evaluate", {
        expression: `
                    const el = document.querySelector('[contenteditable="true"]');
                    if (el) el.focus();
                `,
      });
      await new Promise((r) => setTimeout(r, 500));

      // Insert text
      await sendCommand("Input.insertText", { text: promptText });
      console.log("Metin yapıştırıldı.");
      await new Promise((r) => setTimeout(r, 1000));

      // Click submit button
      await sendCommand("Runtime.evaluate", {
        expression: `
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const submitBtn = buttons.find(b => !b.disabled && (b.getAttribute('aria-label') === 'Send Message' || b.innerHTML.includes('svg')));
                    if (submitBtn) {
                        submitBtn.click();
                        console.log("Submit butonuna tıklandı.");
                    } else {
                        console.log("Gönder butonu bulunamadı, manuel Enter gerekebilir.");
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
