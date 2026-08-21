const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const commitHash = "7891fd5996f835955634cac24949fcd1b23024a7";

const message = `Kalan öksürüz / yetim \`Å\` ve \`Â°\` bozulmalarının tamamı \`messages/tr.json\` içerisinden AST düzeltmesi ile sıfırlandı ve doğrulandı!

- **Local HEAD**: \`${commitHash}\`
- **ls-remote origin master**: \`${commitHash}\`
- **Mojibake Ölçümü**: \`Å\` = 0, \`Â°\` = 0, \`Ã\` = 0 (tamamen temizlendi).

Değişiklikler \`origin/master\`'a push edildi. Doğrulamayı başlatabiliriz!`;

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: `(() => {
        const ce = document.querySelector('div.ProseMirror');
        if (!ce) return 'ProseMirror not found';
        ce.focus();
        document.execCommand('insertText', false, ${JSON.stringify(message)});
        return true;
      })()`,
        returnByValue: true,
      },
    }),
  );
});

let step = 0;
ws.on("message", (data) => {
  step++;
  if (step === 1) {
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
              return 'Submit clicked';
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
  }
});
