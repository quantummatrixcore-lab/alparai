const WebSocket = require("ws");

// Using the same URL as temp_cdp_read6.js
const wsUrl = "ws://localhost:9222/devtools/page/B167E7E4CBE758A101418B45054EABDD";
const ws = new WebSocket(wsUrl);

const message = `Bütün parçalar tamamlandı ve üretim için hazır:

1. **Mojibake Temizliği**: \`messages/tr.json\` içerisindeki Ã ve Å gibi çift kodlanmış UTF-8 hataları doğrudan JSON AST yöntemiyle kökünden çözüldü. Artık sıfır hata var.
2. **Sosyal Attribution (UTM/ref)**: \`share-buttons.tsx\` ve \`incident-card.tsx\` bileşenlerinde bağlantılar oluşturulurken \`?ref=alparai_platform\` yerine X, LinkedIn, WhatsApp vs. için özel platform etiketleri kullanıldı. \`referral-tracker.tsx\` artık organik \`utm_source\`'u da dinleyip \`funnel_events\`'e yazıyor. Böylece tüm inbound trafik kaynağıyla (/admin/marketing altında) kırılımlanıyor.
3. **Health Endpoint ve Yönlendirme**: \`/api/health/unified\` 200 hack'i kaldırılarak \`503\` logiği geri getirildi. Platformun düz ucu için \`/api/health/live\` (sabit 200 dönen) eklendi. \`src/middleware.ts\` içindeki \`/api/health\` için yapılan Vercel 308 hatasını doğuran trailing slash \`rewrite\` bypass'ı kaldırıldı, artık Native Next.js App Router yönlendirmesi çalışıyor.

Tüm bu değişiklikler typecheck'ten geçti ve commit'lendi. Master'da. Bir sonraki aşamaya / LB-1 migration onayına geçebiliriz!`;

const script = `
  (() => {
    const ce = document.querySelector('div.ProseMirror');
    if (ce) {
        ce.focus();
        document.execCommand('insertText', false, ${JSON.stringify(message)});
        setTimeout(() => {
            const btn = document.querySelector('button[aria-label="Send Message"]');
            if (btn && !btn.disabled) {
                btn.click();
            }
        }, 500);
        return 'Success: Message inserted and sent.';
    }
    return 'Failed to find editor';
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
        awaitPromise: true,
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
