const http = require("http");
const crypto = require("crypto");

const targetTabId = "D55CC5CFA81841F8820C275C4106F62F"; // Claude Session tab

const promptText = `Claude, sen şu an Agent-OS (Dünyanın İlk Yapay Zeka İşletim Sistemi) mimarisinin "Başmühendisi" konumundasın. Ben ise Kurucu İrade'yim.

Senden çok kapsamlı bir "Blok Planlama (Master Plan)" çıkarmanı istiyorum. Aşağıdaki yapılacaklar listesindeki (to-do) her bir kritik konuyu derinlemesine analiz et ve bize devasa bir mimari yol haritası sun:

YAPILACAKLAR VE PLANLANACAKLAR LİSTESİ (TODO):
1. Bütün Sürüyü (Wolf Pack / Ajanları) Nasıl Yöneteceğiz? Komuta kontrol merkezi nasıl olmalı, görev dağılımları ve otonom iletişim protokolleri nasıl işleyecek?
2. Ajan Skilleri Nerede Duracak? Skilleri (Ajan yeteneklerini) Google Drive'a mı yükleyeceğiz, yoksa Google NotebookLM üzerinden mi (Kalıcı hafıza/Oracle olarak) besleyeceğiz? Hangisi daha performanslı ve ucuz olur?
3. Google Ekosisteminin Tam Entegrasyonu: Google AI Studio (Ana Zeka), Drive, Cloud Console, Colab, NotebookLM bu altyapıları Agent-OS'un içine tam entegre edecek otonom köprüler nasıl kurulmalı?
4. Avcı Ajan (Hunter Agent) Protokolü: Siber güvenlik, HackerOne, Blind ve sıfır-gün (zero-day) zafiyetlerini takip eden Avcı Ajanların 7/24 devriye algoritmaları.
5. Sürüler Arası İletişim: Mimar Sinan, Fatih, Piri Reis gibi farklı ajanların birbirleriyle çakışmadan, RAM'i şişirmeden (Auto-Kill Mandate) nasıl çalışacağının planlanması.
6. Claude UI (Founder Admin Panel v2) Entegrasyonu: Claude üzerinde tasarlanan arayüzlerin (https://claude.ai/design/p/2a8ce91e-fe84-4be9-a98a-c8c6d0059d53?file=Founder+Admin+Panel+v2.dc.html) Agent-OS tarafından otomatik olarak alınıp AlparAI local Admin paneline nasıl entegre edileceğinin planlanması.

Lütfen bu 6 maddeyi baz alarak; vizyoner, hiçbir detay atlanmamış, teknik altyapısı sağlam (Zero-Cost Maximum Yield prensibine uygun) bir Blok Planlama (Master Architecture Document) yaz.`;

function getTabs() {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

function runNativeWebSocket(wsUrl, scriptToInject) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString("base64");

    const options = {
      port: url.port,
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Key": key,
        "Sec-WebSocket-Version": "13",
      },
    };

    const req = http.request(options);
    req.on("upgrade", (res, socket, head) => {
      let header = Buffer.alloc(14);
      const message = JSON.stringify({
        id: 1,
        method: "Runtime.evaluate",
        params: { expression: scriptToInject, returnByValue: true },
      });
      const payload = Buffer.from(message, "utf8");
      const length = payload.length;

      let headerLen = 0;
      header[0] = 0x81;
      if (length <= 125) {
        header[1] = length | 0x80;
        headerLen = 6;
      } else if (length <= 65535) {
        header[1] = 126 | 0x80;
        header.writeUInt16BE(length, 2);
        headerLen = 8;
      }

      const mask = crypto.randomBytes(4);
      mask.copy(header, headerLen - 4);
      for (let i = 0; i < length; i++) payload[i] ^= mask[i % 4];

      socket.write(Buffer.concat([header.slice(0, headerLen), payload]));

      let responseData = "";
      socket.on("data", (buffer) => {
        if (buffer.length > 2) {
          const payloadLen = buffer[1] & 0x7f;
          let dataOffset = 2;
          if (payloadLen === 126) dataOffset = 4;
          else if (payloadLen === 127) dataOffset = 10;

          const data = buffer.slice(dataOffset).toString("utf8");
          responseData += data;

          if (responseData.includes('"id":1')) {
            try {
              const parsed = JSON.parse(responseData);
              if (parsed.result && parsed.result.result) resolve(parsed.result.result.value);
              else resolve(null);
              socket.destroy();
            } catch (e) {}
          }
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function inject() {
  try {
    const tabs = await getTabs();
    const claudeTab = tabs.find((t) => t.id === targetTabId);
    if (!claudeTab) {
      console.log("Claude sekmesi bulunamadı!");
      return;
    }

    const script = `(() => {
      const el = document.querySelector('div[contenteditable="true"]');
      if (el) {
        el.focus();
        el.innerHTML = '';
        document.execCommand('insertText', false, \`${promptText}\`);
        return "INJECTED_V3";
      }
      return "NOT_FOUND";
    })();`;

    const res = await runNativeWebSocket(claudeTab.webSocketDebuggerUrl, script);
    console.log("Sonuç:", res);
  } catch (e) {
    console.error(e);
  }
}

inject();
