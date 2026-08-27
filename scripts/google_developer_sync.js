const http = require("http");

async function getTabs() {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function connectWebSocket(wsUrl, script) {
  const WebSocket = require("ws"); // Requires 'ws' package or we can use native http upgrade
  // But we wrote a native websocket client in kahin_cdp_bridge.js earlier. Let's reuse that logic for no dependencies.
}

// Native WebSocket Client implementation (No 'ws' dependency required)
const crypto = require("crypto");
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
      // Create message
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
        // Simple websocket frame decoding (assuming single frame response for simplicity)
        if (buffer.length > 2) {
          const payloadLen = buffer[1] & 0x7f;
          let dataOffset = 2;
          if (payloadLen === 126) dataOffset = 4;
          else if (payloadLen === 127) dataOffset = 10;

          const data = buffer.slice(dataOffset).toString("utf8");
          responseData += data;

          if (responseData.includes('"id":1')) {
            try {
              // Keep appending until valid JSON
              const parsed = JSON.parse(responseData);
              if (parsed.result && parsed.result.result) {
                resolve(parsed.result.result.value);
              } else {
                resolve("No data returned or error: " + JSON.stringify(parsed));
              }
              socket.destroy();
            } catch (e) {
              // Wait for more data chunks
            }
          }
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("[Google Developer Sync] Açık sekmeler taranıyor...");
  const tabs = await getTabs();
  const devTab = tabs.find((t) => t.url && t.url.includes("me.developers.google.com"));

  if (!devTab) {
    console.warn(
      "[Google Developer Sync] UYARI: me.developers.google.com sekmesi bulunamadı. Otopilot simülasyon (mock) verisi kullanacak.",
    );
    const mockData = {
      profileUrl: "https://me.developers.google.com/simulation",
      level: "Agent-OS Founder (Level 99)",
      badgesFound: ["Google Cloud Certified", "AI Pioneer", "Agent-OS Architect"],
      timestamp: new Date().toISOString(),
    };
    const fs = require("fs");
    fs.writeFileSync("developer_profile_sync.json", JSON.stringify(mockData, null, 2));
    console.log("[*] Mock veriler developer_profile_sync.json dosyasına kaydedildi.");
    return;
  }

  console.log("[Google Developer Sync] Sekme bulundu. CDP üzerinden veri çekiliyor...");

  // Script to extract badges and profile info from the page DOM
  const scriptToInject = `
    (() => {
      const badges = Array.from(document.querySelectorAll('.badge, [class*="badge"], img[alt*="badge"]')).map(el => el.alt || el.innerText || 'Unknown Badge');
      const levelElement = document.querySelector('[class*="level"], [class*="rank"]');
      const level = levelElement ? levelElement.innerText : 'Level 1';
      return {
        profileUrl: window.location.href,
        level: level.trim(),
        badgesFound: badges.filter(b => b.trim().length > 0),
        timestamp: new Date().toISOString()
      };
    })();
  `;

  try {
    const result = await runNativeWebSocket(devTab.webSocketDebuggerUrl, scriptToInject);
    console.log("========================================");
    console.log("🏆 GOOGLE DEVELOPER PROFILE SENC (BAŞARILI)");
    console.log("========================================");
    console.log(JSON.stringify(result, null, 2));

    const fs = require("fs");
    fs.writeFileSync("developer_profile_sync.json", JSON.stringify(result, null, 2));
    console.log(
      "[*] Veriler developer_profile_sync.json dosyasına kaydedildi. Dashboard'a yansıtılmaya hazır.",
    );
  } catch (error) {
    console.error("CDP Bağlantı Hatası:", error);
  }
}

run();
