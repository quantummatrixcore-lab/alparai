const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

const QuantumBrowserAgent = require("D:\\02_Yapay_Zeka_Motorlari\\Antigravity\\engines\\v52_quantum_browser_agent.js");

async function fetchUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const client = urlStr.startsWith("https") ? https : http;
      const req = client.get(urlStr, { timeout: 5000 }, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => resolve({ status: res.statusCode, body }));
      });
      req.on("error", (err) => resolve({ status: 0, error: err.message }));
      req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "TIMEOUT" }); });
    } catch (e) {
      resolve({ status: 0, error: e.message });
    }
  });
}

async function run360Audit() {
  console.log("================================================================================");
  console.log("🛡️  ANTIGRAVITY 360° MASTER QUANTUM BROWSER AUDIT (BOTGUARD CONSTITUTIONAL)");
  console.log("================================================================================");

  const agent = new QuantumBrowserAgent();
  const consoleErrors = [];
  const networkFailures = [];

  try {
    // 1. Connect to active live tab (STRICT ZERO NEW TAB)
    await agent.connect({ urlMatch: "alparai.com" });
    const target = agent.targetTab;
    console.log(`✓ Attached to live tab [${target.id}]`);
    console.log(`  Title: ${target.title}`);
    console.log(`  URL:   ${target.url}`);

    // Enable CDP domains
    await agent.send("Log.enable");
    await agent.send("Runtime.enable");
    await agent.send("Network.enable");
    await agent.send("Page.enable");

    // Reload page with ignoreCache to get fresh deployed production code
    console.log("✓ Reloading tab with ignoreCache to test fresh production deployment...");
    await agent.send("Page.reload", { ignoreCache: true });
    await new Promise(r => setTimeout(r, 3500));

    // Listen to console events
    agent.on("Runtime.consoleAPICalled", (params) => {
      if (params.type === "error" || params.type === "warning") {
        const text = (params.args || []).map(a => a.value || a.description || JSON.stringify(a)).join(" ");
        consoleErrors.push({ type: params.type, text, timestamp: params.timestamp });
      }
    });

    agent.on("Log.entryAdded", (params) => {
      if (params.entry && params.entry.level === "error") {
        consoleErrors.push({ type: "log-error", text: params.entry.text, url: params.entry.url });
      }
    });

    agent.on("Network.responseReceived", (params) => {
      if (params.response && params.response.status >= 400) {
        networkFailures.push({ url: params.response.url, status: params.response.status, mime: params.response.mimeType });
      }
    });

    // Law 2: Anti-Shrink Screen Protection
    await agent.send("Emulation.clearDeviceMetricsOverride");
    console.log("✓ Law 2 Enforced: Emulation.clearDeviceMetricsOverride executed.");

    // Wait a brief moment for any pending events
    await new Promise(r => setTimeout(r, 1200));

    // Execute deep in-browser audit evaluation
    const domAuditExpr = `
    (() => {
      const results = {};

      // 1. Visual & Responsive / Overflow
      const innerW = window.innerWidth;
      const scrollW = document.documentElement.scrollWidth;
      const isHorizontalOverflow = scrollW > innerW + 1;
      const overflowingElements = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerW + 2) {
          const sel = el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0,2).join('.') : el.tagName.toLowerCase());
          overflowingElements.push({ sel, right: Math.round(rect.right), innerW });
        }
      });
      results.layout = {
        innerW,
        scrollW,
        isHorizontalOverflow,
        overflowingCount: overflowingElements.length,
        overflowingElements: overflowingElements.slice(0, 5)
      };

      // 2. Broken Images
      const brokenImgs = [];
      document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          brokenImgs.push({ src: img.src, alt: img.alt || null });
        }
      });
      results.images = {
        total: document.querySelectorAll('img').length,
        brokenCount: brokenImgs.length,
        broken: brokenImgs.slice(0, 5)
      };

      // 3. i18n & HTML Entity Leaks
      const rawKeyRegex = /(\\[MISSING:[^\\]]+\\]|MISSING_MESSAGE|\\b(?:incident|common|admin|sidebar|dashboard|nav|error|auth)\\.[a-z0-9_]{3,}\\b)/i;
      const entityRegex = /(&#[0-9]{2,4};|&(?:quot|apos|amp|lt|gt);)/;
      const missingKeys = [];
      const entityLeaks = [];

      // Check title
      if (document.title.match(entityRegex)) {
        entityLeaks.push({ location: 'title', text: document.title });
      }
      if (document.title.match(rawKeyRegex)) {
        missingKeys.push({ location: 'title', text: document.title });
      }

      // Check all visible text nodes
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const txt = node.textContent.trim();
        if (!txt || txt.length < 2) continue;
        if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) continue;

        const mKey = txt.match(rawKeyRegex);
        if (mKey) {
          missingKeys.push({ tag: node.parentElement.tagName, text: txt.slice(0, 100) });
        }
        const mEnt = txt.match(entityRegex);
        if (mEnt) {
          entityLeaks.push({ tag: node.parentElement.tagName, text: txt.slice(0, 100), entity: mEnt[0] });
        }
      }
      results.i18n = {
        missingKeysCount: missingKeys.length,
        missingKeys: missingKeys.slice(0, 10),
        entityLeaksCount: entityLeaks.length,
        entityLeaks: entityLeaks.slice(0, 10)
      };

      // 4. LocalStorage & SessionStorage Security
      const localKeys = Object.keys(localStorage);
      const sessionKeys = Object.keys(sessionStorage);
      const sensitivePatterns = /token|jwt|secret|key|auth|password|credential/i;
      const suspiciousStorage = [];
      localKeys.forEach(k => {
        if (sensitivePatterns.test(k)) {
          suspiciousStorage.push({ storage: 'local', key: k, valueSnippet: (localStorage.getItem(k) || '').slice(0, 30) });
        }
      });
      results.storage = {
        localCount: localKeys.length,
        sessionCount: sessionKeys.length,
        suspiciousCount: suspiciousStorage.length,
        suspicious: suspiciousStorage
      };

      // 5. Performance & CWV
      const navEntry = performance.getEntriesByType('navigation')[0] || {};
      const paintEntries = performance.getEntriesByType('paint');
      let fcp = 0;
      paintEntries.forEach(p => {
        if (p.name === 'first-contentful-paint') fcp = Math.round(p.startTime);
      });

      results.cwv = {
        fcpMs: fcp,
        domContentLoadedMs: Math.round(navEntry.domContentLoadedEventEnd || 0),
        loadEventMs: Math.round(navEntry.loadEventEnd || 0),
        transferSize: navEntry.transferSize || 0
      };

      // 6. Accessibility (WCAG 2.2 AA)
      let smallTouchTargets = 0;
      let missingAltCount = 0;
      let emptyInteractive = 0;

      document.querySelectorAll('button, a, input, select, textarea').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          if (r.width < 24 || r.height < 24) {
            smallTouchTargets++;
          }
          if (el.tagName === 'BUTTON' || el.tagName === 'A') {
            const hasText = el.innerText.trim().length > 0;
            const hasAria = el.getAttribute('aria-label') || el.getAttribute('title');
            if (!hasText && !hasAria && !el.querySelector('svg, img')) {
              emptyInteractive++;
            }
          }
        }
      });

      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('alt')) missingAltCount++;
      });

      results.wcag = {
        smallTouchTargets,
        missingAltCount,
        emptyInteractive
      };

      // 7. SEO & Structural Data
      const titleTag = document.title;
      const metaDesc = document.querySelector('meta[name="description"]')?.content || null;
      const canonical = document.querySelector('link[rel="canonical"]')?.href || null;
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content || null;
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]').length;

      results.seo = {
        hasTitle: Boolean(titleTag && titleTag.length > 5),
        title: titleTag,
        hasDescription: Boolean(metaDesc && metaDesc.length > 10),
        description: metaDesc,
        hasCanonical: Boolean(canonical),
        hasOgTitle: Boolean(ogTitle),
        hasOgImage: Boolean(ogImage),
        jsonLdCount: jsonLdScripts
      };

      // 8. Client-Side DOM Sinks (OWASP Client-Side Security)
      const allEls = Array.from(document.querySelectorAll('*'));
      const hasJsHref = allEls.some(el => (el.getAttribute('href') || '').trim().toLowerCase().startsWith('javascript:'));
      const hasInlineHandlers = allEls.some(el => {
        for (let i = 0; i < el.attributes.length; i++) {
          if (el.attributes[i].name.startsWith('on') && el.attributes[i].value) return true;
        }
        return false;
      });
      const dangerousPatterns = hasJsHref || hasInlineHandlers;
      results.security = {
        dangerousInlineJs: dangerousPatterns,
        formsWithoutHttps: Array.from(document.querySelectorAll('form')).filter(f => f.action && f.action.startsWith('http://')).length
      };

      return results;
    })()
    `;

    const evalRes = await agent.send("Runtime.evaluate", {
      expression: domAuditExpr,
      returnByValue: true,
      awaitPromise: true
    });

    const domData = evalRes?.result?.value || {};

    // 9. External Server Asset & Compliance Verification
    console.log("--- Checking Public Endpoints (/robots.txt, /sitemap.xml, /llms.txt, /api/health) ---");
    const [robotsRes, sitemapRes, llmsRes, healthRes] = await Promise.all([
      fetchUrl("https://www.alparai.com/robots.txt"),
      fetchUrl("https://www.alparai.com/sitemap.xml"),
      fetchUrl("https://www.alparai.com/llms.txt"),
      fetchUrl("https://www.alparai.com/api/health"),
    ]);

    const endpointStatus = {
      robots: { status: robotsRes.status, hasContent: (robotsRes.body || "").length > 20 },
      sitemap: { status: sitemapRes.status, isXml: (sitemapRes.body || "").includes("urlset") },
      llms: { status: llmsRes.status, hasContent: (llmsRes.body || "").length > 20 },
      health: { status: healthRes.status, isHealthy: (healthRes.body || "").includes("healthy") },
    };

    // Calculate 10-Pillar 1000-Point Audit Scoring
    const pillars = {};

    // P1: Visual & Layout (100 pts)
    let p1 = 100;
    if (domData.layout?.isHorizontalOverflow) p1 -= 40;
    if (domData.images?.brokenCount > 0) p1 -= Math.min(30, domData.images.brokenCount * 10);
    pillars["Visual & Responsive Integrity"] = { score: Math.max(0, p1), data: domData.layout, images: domData.images };

    // P2: i18n & Language Purity (100 pts)
    let p2 = 100;
    if (domData.i18n?.missingKeysCount > 0) p2 -= Math.min(50, domData.i18n.missingKeysCount * 10);
    if (domData.i18n?.entityLeaksCount > 0) p2 -= Math.min(30, domData.i18n.entityLeaksCount * 10);
    pillars["Deep i18n & Language Purity"] = { score: Math.max(0, p2), data: domData.i18n };

    // P3: Auth & Session Security (100 pts)
    let p3 = 100;
    if (domData.storage?.suspiciousCount > 0) p3 -= 30;
    pillars["Auth & Session Security"] = { score: Math.max(0, p3), data: domData.storage };

    // P4: Forms & Idempotency (100 pts)
    let p4 = 100;
    if (domData.security?.formsWithoutHttps > 0) p4 -= 30;
    pillars["Forms & Idempotency"] = { score: p4 };

    // P5: Core Web Vitals (100 pts)
    let p5 = 100;
    if (domData.cwv?.fcpMs > 2500) p5 -= 25;
    pillars["Google Core Web Vitals (CWV)"] = { score: p5, data: domData.cwv };

    // P6: Technical SEO & Schema (100 pts)
    let p6 = 100;
    if (!domData.seo?.hasTitle) p6 -= 25;
    if (!domData.seo?.hasDescription) p6 -= 25;
    if (!domData.seo?.hasCanonical) p6 -= 15;
    if (domData.seo?.jsonLdCount === 0) p6 -= 15;
    if (endpointStatus.robots.status !== 200) p6 -= 10;
    if (endpointStatus.sitemap.status !== 200) p6 -= 10;
    pillars["Technical SEO & Structured Data"] = { score: Math.max(0, p6), data: domData.seo, endpoints: endpointStatus };

    // P7: Enterprise Maturity & Regulatory (100 pts)
    let p7 = (endpointStatus.llms.status === 200 && endpointStatus.health.isHealthy) ? 100 : (endpointStatus.llms.status === 200 ? 95 : 85);
    pillars["Enterprise Maturity & Regulatory"] = { score: p7 };

    // P8: OWASP Client-Side Security (100 pts)
    let p8 = 100;
    if (domData.security?.dangerousInlineJs) p8 -= 20;
    if (domData.security?.formsWithoutHttps > 0) p8 -= 50;
    pillars["OWASP Client-Side Security"] = { score: Math.max(0, p8), data: domData.security };

    // P9: WCAG 2.2 AA Accessibility (100 pts)
    let p9 = 100;
    if (domData.wcag?.smallTouchTargets > 0) p9 -= Math.min(25, domData.wcag.smallTouchTargets * 2);
    if (domData.wcag?.missingAltCount > 0) p9 -= Math.min(25, domData.wcag.missingAltCount * 5);
    pillars["WCAG 2.2 AA Accessibility"] = { score: Math.max(0, p9), data: domData.wcag };

    // P10: Runtime Zero-Error Gate (100 pts)
    let p10 = 100;
    const realErrors = consoleErrors.filter(e => e.type === "error" || e.type === "log-error");
    if (realErrors.length > 0) p10 -= Math.min(60, realErrors.length * 15);
    if (networkFailures.length > 0) p10 -= Math.min(40, networkFailures.length * 10);
    pillars["Runtime Zero-Error Gate"] = {
      score: Math.max(0, p10),
      consoleErrorsCount: realErrors.length,
      consoleErrors: realErrors.slice(0, 10),
      networkFailuresCount: networkFailures.length,
      networkFailures: networkFailures.slice(0, 5)
    };

    // Total Score
    let totalScore = 0;
    Object.values(pillars).forEach(p => totalScore += p.score);

    // Defect Manifest Compilation
    const defects = [];
    if (domData.layout?.isHorizontalOverflow) {
      defects.push({
        id: "DEF-001",
        pillar: "Visual & Layout",
        severity: "CRITICAL",
        description: `Horizontal scroll detected! scrollWidth (${domData.layout.scrollW}px) > innerWidth (${domData.layout.innerW}px)`,
        elements: domData.layout.overflowingElements
      });
    }
    if (domData.i18n?.entityLeaksCount > 0) {
      defects.push({
        id: "DEF-002",
        pillar: "i18n & Language",
        severity: "HIGH",
        description: `Unescaped HTML entities found in text content or title: ${domData.i18n.entityLeaks.map(e => e.entity || e.text).join(", ")}`,
        samples: domData.i18n.entityLeaks
      });
    }
    if (domData.i18n?.missingKeysCount > 0) {
      defects.push({
        id: "DEF-003",
        pillar: "i18n & Language",
        severity: "CRITICAL",
        description: `Raw or missing translation keys exposed on UI: ${domData.i18n.missingKeys.map(k => k.text).join(", ")}`,
        samples: domData.i18n.missingKeys
      });
    }
    if (realErrors.length > 0) {
      defects.push({
        id: "DEF-004",
        pillar: "Runtime",
        severity: "HIGH",
        description: `${realErrors.length} console errors detected on runtime`,
        samples: realErrors
      });
    }
    if (networkFailures.length > 0) {
      defects.push({
        id: "DEF-005",
        pillar: "Runtime",
        severity: "HIGH",
        description: `${networkFailures.length} network requests failed with 4xx/5xx status`,
        samples: networkFailures
      });
    }
    if (!domData.seo?.hasDescription) {
      defects.push({
        id: "DEF-006",
        pillar: "SEO",
        severity: "MEDIUM",
        description: "Missing or short meta description tag"
      });
    }
    if (domData.wcag?.smallTouchTargets > 0) {
      defects.push({
        id: "DEF-007",
        pillar: "Accessibility",
        severity: "LOW",
        description: `${domData.wcag.smallTouchTargets} interactive elements have touch targets smaller than 24x24px`
      });
    }

    const manifest = {
      timestamp: new Date().toISOString(),
      url: target.url,
      totalScore,
      maxScore: 1000,
      grade: totalScore >= 950 ? "A+" : totalScore >= 900 ? "A" : totalScore >= 800 ? "B" : totalScore >= 700 ? "C" : "D",
      pillars,
      defectsCount: defects.length,
      defects
    };

    const manifestPath = path.join(process.cwd(), "DEFECT_MANIFEST.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`\n✓ Generated DEFECT_MANIFEST.json (${defects.length} defects identified, Total Score: ${totalScore}/1000)`);

    console.log("\n=== 10-PILLAR 1000-POINT SCORECARD ===");
    Object.entries(pillars).forEach(([name, p]) => {
      const bar = "█".repeat(Math.round(p.score / 10)).padEnd(10, "░");
      console.log(`  ${name.padEnd(36)}: [${bar}] ${String(p.score).padStart(3)}/100`);
    });
    console.log(`\n  TOTAL SCORE: ${totalScore}/1000 (Grade: ${manifest.grade})`);

    if (defects.length > 0) {
      console.log("\n=== IDENTIFIED DEFECTS SUMMARY ===");
      defects.forEach(d => {
        console.log(`  [${d.severity}] ${d.id} (${d.pillar}): ${d.description}`);
      });
    }

    await agent.disconnect();
    return manifest;
  } catch (err) {
    console.error("360 Audit execution error:", err);
    try { await agent.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

run360Audit();