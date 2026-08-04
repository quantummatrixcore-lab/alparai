import WebSocket from "ws";
import http from "http";

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:9222/json", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function auditPages() {
  const tabs = await getTabs();
  const targetTab = tabs.find((t) => t.url && t.url.includes("alparai.com")) || tabs[0];

  if (!targetTab || !targetTab.webSocketDebuggerUrl) {
    console.error("No active alparai.com Chrome tab found.");
    process.exit(1);
  }

  console.log(`Connecting to existing Chrome tab: ${targetTab.title} (${targetTab.url})`);
  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

  let idCounter = 1;
  const send = (method, params = {}) => {
    const id = idCounter++;
    return new Promise((resolve) => {
      const handler = (msg) => {
        const res = JSON.parse(msg);
        if (res.id === id) {
          ws.removeListener("message", handler);
          resolve(res.result);
        }
      };
      ws.on("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((resolve) => ws.on("open", resolve));

  const routes = [
    "/tr/admin",
    "/tr/admin/moderation",
    "/tr/admin/analysis",
    "/tr/admin/expert-analysis",
    "/tr/admin/k-benchmark",
    "/tr/admin/api-metrics",
    "/tr/admin/api-keys",
    "/tr/admin/cron-health",
    "/tr/admin/codebase-hygiene",
    "/tr/admin/modular-architecture",
    "/tr/admin/takedown",
    "/tr/admin/settings",
    "/tr/admin/startup-health",
    "/tr/admin/dual-channel-scoring",
    "/tr/admin/master-plan",
    "/tr/admin/providers",
  ];

  const results = [];

  for (const route of routes) {
    const fullUrl = `https://www.alparai.com${route}`;
    console.log(`Auditing: ${fullUrl}`);

    await send("Page.navigate", { url: fullUrl });
    await new Promise((r) => setTimeout(r, 4000));

    const evalResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const bodyText = document.body.innerText || '';
        const title = document.title;
        const url = window.location.href;

        // Check for anomalies
        const has76278 = bodyText.includes('76278');
        const hasNaN = bodyText.includes('NaN');
        const hasUndefined = bodyText.includes('undefined');
        const hasError = bodyText.includes('500 Internal') || bodyText.includes('404 Not Found');

        // Check i18n fallback strings
        const missingI18nMatches = bodyText.match(/[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+/g) || [];
        
        // Sample numbers
        const scoreMatches = bodyText.match(/\\b\\d{4,9}\\b/g) || [];

        return {
          title,
          url,
          textLength: bodyText.length,
          has76278,
          hasNaN,
          hasUndefined,
          hasError,
          missingI18nSample: missingI18nMatches.slice(0, 5),
          largeNumbersSample: scoreMatches.slice(0, 5),
          firstHeader: (document.querySelector('h1, h2')?.innerText || '').trim()
        };
      })()`,
      returnByValue: true,
    });

    results.push({
      route,
      audit: evalResult?.result?.value || { error: "Eval failed" },
    });
  }

  ws.close();
  console.log("\n=== 360° ADMIN PANEL AUDIT REPORT ===");
  console.log(JSON.stringify(results, null, 2));
}

auditPages().catch(console.error);
