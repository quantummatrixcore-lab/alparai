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

async function auditAll56AdminRoutes() {
  const tabs = await getTabs();
  const targetTab = tabs.find((t) => t.url && t.url.includes("alparai.com")) || tabs[0];

  if (!targetTab || !targetTab.webSocketDebuggerUrl) {
    console.error("No active alparai.com Chrome tab found.");
    process.exit(1);
  }

  console.log(`[CDP 360° Audit] Connecting to existing tab: ${targetTab.title} (${targetTab.url})`);
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
    "/tr/admin/advisory-board",
    "/tr/admin/ai-orchestrator",
    "/tr/admin/ai-pulse",
    "/tr/admin/analysis",
    "/tr/admin/api-keys",
    "/tr/admin/api-management",
    "/tr/admin/api-metrics",
    "/tr/admin/audit",
    "/tr/admin/autopilot",
    "/tr/admin/autopilot/analytics",
    "/tr/admin/billing",
    "/tr/admin/codebase-hygiene",
    "/tr/admin/cron-health",
    "/tr/admin/crons",
    "/tr/admin/cross-audit-dashboard",
    "/tr/admin/dsar",
    "/tr/admin/dual-channel-scoring",
    "/tr/admin/ecosystem",
    "/tr/admin/expert-analysis",
    "/tr/admin/experts",
    "/tr/admin/feature-flags",
    "/tr/admin/finance",
    "/tr/admin/geo",
    "/tr/admin/grants",
    "/tr/admin/health",
    "/tr/admin/import",
    "/tr/admin/innovations",
    "/tr/admin/integrations",
    "/tr/admin/investors",
    "/tr/admin/k-benchmark",
    "/tr/admin/launch-signal",
    "/tr/admin/linkedin",
    "/tr/admin/marketing",
    "/tr/admin/master-plan",
    "/tr/admin/moderation",
    "/tr/admin/modular-architecture",
    "/tr/admin/outreach",
    "/tr/admin/platforms",
    "/tr/admin/providers",
    "/tr/admin/redaction-queue",
    "/tr/admin/resources",
    "/tr/admin/settings",
    "/tr/admin/signals",
    "/tr/admin/slo-dashboard",
    "/tr/admin/social",
    "/tr/admin/startup-health",
    "/tr/admin/strategy",
    "/tr/admin/strategy/questionnaire",
    "/tr/admin/strategy/risks",
    "/tr/admin/strategy/roadmap",
    "/tr/admin/strategy/state-support",
    "/tr/admin/strategy/swot",
    "/tr/admin/strategy/valuation",
    "/tr/admin/takedown",
    "/tr/admin/users"
  ];

  const results = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const fullUrl = `https://www.alparai.com${route}`;
    console.log(`[${i + 1}/${routes.length}] Auditing: ${fullUrl}`);

    await send("Page.navigate", { url: fullUrl });
    await new Promise((r) => setTimeout(r, 3500));

    const evalResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const bodyText = document.body.innerText || '';
        const title = document.title || '';
        const url = window.location.href;

        // Check for anomalies
        const has76278 = bodyText.includes('76278');
        const hasNaN = bodyText.includes('NaN');
        const hasUndefined = bodyText.includes('undefined');
        const hasErrorPage = bodyText.includes('500 Internal') || bodyText.includes('404 Not Found') || bodyText.includes('An error occurred');

        // i18n checks
        const missingI18nMatches = bodyText.match(/[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+/g) || [];
        
        // Element counts
        const buttonCount = document.querySelectorAll('button').length;
        const linkCount = document.querySelectorAll('a').length;
        const inputCount = document.querySelectorAll('input, select, textarea').length;
        const tableRowCount = document.querySelectorAll('tr').length;

        // First header
        const header = (document.querySelector('h1, h2, h3')?.innerText || '').trim();

        return {
          title,
          url,
          textLength: bodyText.length,
          header,
          has76278,
          hasNaN,
          hasUndefined,
          hasErrorPage,
          missingI18nCount: missingI18nMatches.length,
          missingI18nSample: missingI18nMatches.slice(0, 3),
          buttonCount,
          linkCount,
          inputCount,
          tableRowCount,
          isLiveContent: bodyText.length > 300
        };
      })()`,
      returnByValue: true,
    });

    const auditData = evalResult?.result?.value || { error: "Execution failed" };
    results.push({ index: i + 1, route, audit: auditData });
  }

  ws.close();
  console.log("\n=== 56 ADMIN ROUTES 360° CDP AUDIT REPORT ===");
  console.log(JSON.stringify(results, null, 2));
}

auditAll56AdminRoutes().catch(console.error);
