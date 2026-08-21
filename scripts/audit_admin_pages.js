const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const adminRoutes = [
  "/en/admin",
  "/en/admin/advisor",
  "/en/admin/advisory-board",
  "/en/admin/ai-hub",
  "/en/admin/ai-hub/autopilot",
  "/en/admin/ai-hub/autopilot/analytics",
  "/en/admin/ai-hub/jules",
  "/en/admin/ai-hub/orchestrator",
  "/en/admin/ai-hub/swarm",
  "/en/admin/analytics-hub",
  "/en/admin/analytics-hub/analysis",
  "/en/admin/analytics-hub/expert-analysis",
  "/en/admin/analytics-hub/k-benchmark",
  "/en/admin/api-keys",
  "/en/admin/api-management",
  "/en/admin/audit",
  "/en/admin/billing",
  "/en/admin/cockpit",
  "/en/admin/codebase-hygiene",
  "/en/admin/cron-health",
  "/en/admin/crons",
  "/en/admin/cross-audit-dashboard",
  "/en/admin/dsar",
  "/en/admin/dual-channel-scoring",
  "/en/admin/ecosystem",
  "/en/admin/experts",
  "/en/admin/feature-flags",
  "/en/admin/finance",
  "/en/admin/geo",
  "/en/admin/grants",
  "/en/admin/health",
  "/en/admin/import",
  "/en/admin/innovations",
  "/en/admin/integrations",
  "/en/admin/investors",
  "/en/admin/launch-signal",
  "/en/admin/legal-tracker",
  "/en/admin/linkedin",
  "/en/admin/marketing",
  "/en/admin/metrics-hub",
  "/en/admin/metrics-hub/ai-pulse",
  "/en/admin/metrics-hub/api-metrics",
  "/en/admin/metrics-hub/signals",
  "/en/admin/metrics-hub/slo-dashboard",
  "/en/admin/moderation",
  "/en/admin/modular-architecture",
  "/en/admin/outreach",
  "/en/admin/platforms",
  "/en/admin/providers",
  "/en/admin/quotas",
  "/en/admin/redaction-queue",
  "/en/admin/resources",
  "/en/admin/seo-performance",
  "/en/admin/settings",
  "/en/admin/social",
  "/en/admin/startup-health",
  "/en/admin/strategy",
  "/en/admin/strategy/master-plan",
  "/en/admin/strategy/questionnaire",
  "/en/admin/strategy/risks",
  "/en/admin/strategy/roadmap",
  "/en/admin/strategy/state-support",
  "/en/admin/strategy/swot",
  "/en/admin/strategy/valuation",
  "/en/admin/takedown",
  "/en/admin/users",
  "/en/admin/velocity",
  "/en/admin/vendor-portal",
];

function getWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json/list", (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const tabs = JSON.parse(body);
            const adminTab = tabs.find((t) => t.url.includes("alparai.com")) || tabs[0];
            if (adminTab && adminTab.webSocketDebuggerUrl) {
              resolve(adminTab.webSocketDebuggerUrl);
            } else {
              reject(new Error("No valid Chrome tab found for CDP"));
            }
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function sendCDPCommand(ws, method, params = {}, id) {
  return new Promise((resolve) => {
    const handler = (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.id === id) {
          ws.off("message", handler);
          resolve(msg.result);
        }
      } catch (e) {}
    };
    ws.on("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function runAudit() {
  console.log("Connecting to Chrome CDP...");
  const wsUrl = await getWebSocketUrl();
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve) => ws.on("open", resolve));
  console.log("Connected to Chrome CDP WebSocket!");

  let cmdId = 100;
  const results = [];

  await sendCDPCommand(ws, "Page.enable", {}, ++cmdId);
  await sendCDPCommand(ws, "Runtime.enable", {}, ++cmdId);
  await sendCDPCommand(ws, "DOM.enable", {}, ++cmdId);

  for (let i = 0; i < adminRoutes.length; i++) {
    const route = adminRoutes[i];
    const fullUrl = `https://www.alparai.com${route}`;
    console.log(`[${i + 1}/${adminRoutes.length}] Testing route: ${route}`);

    const consoleLogs = [];
    const jsExceptions = [];

    const messageHandler = (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.method === "Runtime.consoleAPICalled") {
          const text = (msg.params.args || []).map((a) => a.value || a.description || "").join(" ");
          if (msg.params.type === "error" && text.trim()) {
            consoleLogs.push(text.substring(0, 150));
          }
        } else if (msg.method === "Runtime.exceptionThrown") {
          jsExceptions.push(msg.params.exceptionDetails.text || "Unhandled exception");
        }
      } catch (e) {}
    };

    ws.on("message", messageHandler);

    // Navigate to page
    await sendCDPCommand(ws, "Page.navigate", { url: fullUrl }, ++cmdId);

    // Wait 2.5 seconds for page render
    await new Promise((r) => setTimeout(r, 2500));

    // Inspect DOM state strictly
    const evalResult = await sendCDPCommand(
      ws,
      "Runtime.evaluate",
      {
        expression: `(() => {
        const bodyText = document.body ? document.body.innerText : '';
        const buttons = Array.from(document.querySelectorAll('button'));
        const links = Array.from(document.querySelectorAll('a'));
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        const tables = Array.from(document.querySelectorAll('table'));
        const cards = Array.from(document.querySelectorAll('.rounded-xl, .rounded-lg, .card, [class*="card"]'));

        const errorBoundaryElement = document.querySelector('[data-nextjs-dialog-header], .nextjs-container-errors');
        const h1Error = Array.from(document.querySelectorAll('h1')).some(h => (h.innerText || '').includes('Something went wrong'));
        const hasErrorBoundary = !!errorBoundaryElement || h1Error;
        const is404 = document.title.includes('404') || (bodyText.includes('This page could not be found') && buttons.length < 5);
        const is500 = document.title.includes('500') || (bodyText.includes('Internal Server Error') && buttons.length < 5);

        const untranslatedMatch = bodyText.match(/\\b(admin\\.[a-z0-9_]+|public\\.[a-z0-9_]+|missing_translation)\\b/gi) || [];

        return {
          title: document.title,
          url: location.href,
          is404,
          is500,
          hasErrorBoundary,
          buttonCount: buttons.length,
          linkCount: links.length,
          inputCount: inputs.length,
          tableCount: tables.length,
          cardCount: cards.length,
          untranslatedKeys: Array.from(new Set(untranslatedMatch)),
          bodySnippet: bodyText.substring(0, 200).replace(/\\s+/g, ' ')
        };
      })()`,
        returnByValue: true,
      },
      ++cmdId,
    );

    ws.off("message", messageHandler);

    const data =
      evalResult && evalResult.result && evalResult.result.value ? evalResult.result.value : {};

    // Attempt clicking a safe interactive button on the page
    let clickedButton = null;
    try {
      const clickRes = await sendCDPCommand(
        ws,
        "Runtime.evaluate",
        {
          expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button:not([disabled])'));
          const safeBtn = btns.find(b => {
            const txt = (b.innerText || '').toLowerCase();
            return txt.includes('refresh') || txt.includes('analiz') || txt.includes('run') || txt.includes('tab') || txt.includes('filter') || txt.includes('view') || txt.includes('re-run');
          });
          if (safeBtn) {
            safeBtn.click();
            return safeBtn.innerText.trim().substring(0, 30);
          }
          return null;
        })()`,
          returnByValue: true,
        },
        ++cmdId,
      );

      if (clickRes && clickRes.result && clickRes.result.value) {
        clickedButton = clickRes.result.value;
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (err) {}

    const status = data.hasErrorBoundary
      ? "ERROR_BOUNDARY"
      : data.is500
        ? "HTTP_500"
        : data.is404
          ? "HTTP_404"
          : "PASS";

    const auditEntry = {
      route,
      title: data.title || "",
      status,
      stats: {
        buttons: data.buttonCount || 0,
        links: data.linkCount || 0,
        inputs: data.inputCount || 0,
        tables: data.tableCount || 0,
        cards: data.cardCount || 0,
      },
      untranslatedKeys: data.untranslatedKeys || [],
      consoleErrors: consoleLogs,
      jsExceptions,
      testedButton: clickedButton,
      bodySnippet: data.bodySnippet || "",
    };

    results.push(auditEntry);
    console.log(
      `   -> Status: ${status} | Buttons: ${auditEntry.stats.buttons} | Links: ${auditEntry.stats.links} | Tested Btn: ${clickedButton || "None"}`,
    );
  }

  ws.close();

  // Save report JSON
  const reportPath = path.join(__dirname, "admin_panel_browser_audit.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Summary
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status !== "PASS").length;
  console.log(`\n==================================================`);
  console.log(`FULL BROWSER AUDIT COMPLETE!`);
  console.log(`Total Pages Tested: ${results.length}`);
  console.log(`PASSED: ${passed} | ISSUES: ${failed}`);
  console.log(`Full report saved to: ${reportPath}`);
  console.log(`==================================================\n`);
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
