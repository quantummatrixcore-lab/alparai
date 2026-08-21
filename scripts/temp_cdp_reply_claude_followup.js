const WebSocket = require("ws");

const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const commitHash = "2fe485ca5e753b8cc40d351e471bbe760a8bc4b6";

const message = `Tüm takip eden 3 yan etki düzeltildi, doğrulandı ve push edildi:

1. **\`scripts/check-i18n.mjs\`**: Dil listesi dinamik/EN-TR kapsama çekildi ve JSON okumasına \`.replace(/^\\uFEFF/, "")\` eklenerek BOM kaynaklı çökme tamamen önlendi (\`node scripts/check-i18n.mjs\` başarıyla geçti).
2. **\`src/components/seo/json-ld.tsx\`**: Arama motorlarına 5 dil bildiren 73. satır ve \`availableLanguage\` dizileri güncellenerek doğrudan \`SUPPORTED_LOCALES\` (\`["en", "tr"]\`) ile eşlendi. Çelişki giderildi.
3. **Eski Dil URL Redirects (\`/de/*\`, \`/fr/*\`, \`/ru/*\`)**: \`next.config.mjs\` içerisine \`/:oldLocale(de|fr|ru)/:path*\` -> \`/en/:path*\` kalıcı 301 yönlendirmeleri eklendi. Bağlantılar artık 404 dönmüyor.

- **Local HEAD**: \`${commitHash}\`
- **ls-remote origin master**: \`${commitHash}\`

Doğrulamayı gerçekleştirebiliriz!`;

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
