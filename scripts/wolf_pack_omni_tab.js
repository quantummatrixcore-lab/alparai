const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

console.log(
  "[Wolf Pack Omni-Tab] Siber Birlikler devrede. Tüm açık sekmeler (Port 9222) taranıyor...",
);

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
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: "Timeout" });
    });

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
              if (parsed.result && parsed.result.result) {
                resolve(parsed.result.result.value);
              } else {
                resolve({ error: "No return value" });
              }
              socket.destroy();
            } catch (e) {
              // Wait for more chunks
            }
          }
        }
      });
    });

    req.on("error", (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  const tabs = await getTabs();
  const targetTabs = tabs.filter((t) => t.type === "page" && t.webSocketDebuggerUrl);
  console.log(`[Wolf Pack Omni-Tab] ${targetTabs.length} adet yönetilebilir sekme tespit edildi.`);

  const results = [];
  let claudeHtml = null;

  for (const tab of targetTabs) {
    const url = tab.url || "";
    let scriptToInject = "";
    let tabRole = "Genel Sekme";

    if (url.includes("claude.ai/design")) {
      tabRole = "Claude Design (Mimar Sinan)";
      scriptToInject = `
        (() => {
          return {
            title: document.title,
            url: window.location.href,
            extractedHTML: document.documentElement.outerHTML.substring(0, 100000) // Snapshot
          };
        })();
      `;
    } else if (url.includes("linkedin.com")) {
      tabRole = "LinkedIn OSINT (Teşkilat-ı Mahsusa)";
      scriptToInject = `
        (() => {
          return {
            title: document.title,
            url: window.location.href,
            feedText: document.body.innerText.substring(0, 500)
          };
        })();
      `;
    } else if (url.includes("cloudflare.com") || url.includes("vercel.com")) {
      tabRole = "Altyapı Paneli (Siber Birlikler)";
      scriptToInject = `
        (() => {
          return {
            title: document.title,
            url: window.location.href,
            statusText: document.body.innerText.substring(0, 500)
          };
        })();
      `;
    } else {
      scriptToInject = `
        (() => {
          return {
            title: document.title,
            url: window.location.href
          };
        })();
      `;
    }

    console.log(`[*] Sızılıyor: [${tabRole}] - ${tab.title.substring(0, 40)}...`);
    const result = await runNativeWebSocket(tab.webSocketDebuggerUrl, scriptToInject);

    if (result && result.extractedHTML) {
      claudeHtml = result.extractedHTML;
      delete result.extractedHTML; // JSON boyutunu küçültmek için ayırıyoruz
    }

    results.push({
      tabId: tab.id,
      role: tabRole,
      data: result,
    });
  }

  const resultsPath = path.join(__dirname, "omni_tab_results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n[+] Omni-Tab Operasyonu Başarılı! Tüm veriler şuraya yazıldı: ${resultsPath}`);

  if (claudeHtml) {
    const htmlPath = path.join(__dirname, "extracted_claude_design.html");
    fs.writeFileSync(htmlPath, claudeHtml);
    console.log(`[+] Mimar Sinan: Claude Design HTML içeriği başarıyla kopyalandı -> ${htmlPath}`);
  }
}

run();
