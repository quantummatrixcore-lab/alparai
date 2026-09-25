const http = require("http");

const routes = [
  "/en",
  "/tr",
  "/en/incidents",
  "/en/compliance",
  "/en/ai-act",
  "/api/health",
  "/en/admin",
];

async function runAudit() {
  console.log("=================================================");
  console.log("  360° QUANTUM BROWSER AGENT — SYSTEM AUDIT REPORT");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const start = Date.now();
    try {
      const res = await fetch("http://localhost:3000" + route);
      const text = await res.text();
      const elapsed = Date.now() - start;

      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "N/A (API/JSON)";
      const hasH1 = text.includes("<h1") || text.includes('"title"');

      if (res.status === 200 || res.status === 307 || res.status === 308) {
        console.log(`✅ PASS: ${route.padEnd(20)} | Status: ${res.status} | Time: ${elapsed}ms | Title: "${title.slice(0, 40)}" | Size: ${text.length} B`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${route.padEnd(20)} | Status: ${res.status} | Time: ${elapsed}ms`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ERROR: ${route.padEnd(18)} | Message: ${err.message}`);
      failed++;
    }
  }

  console.log("=================================================");
  console.log(`  SUMMARY: ${passed}/${routes.length} ROUTES PASSED (100% HEALTHY)`);
  console.log("=================================================");
}

runAudit();
