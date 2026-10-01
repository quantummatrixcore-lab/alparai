const WebSocket = require('ws');
const http = require('http');

async function getTargetWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          // Pick page target (prefer cloudflare tab or first page target)
          const pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
          if (pageTarget) resolve(pageTarget.webSocketDebuggerUrl);
          else reject(new Error('No active page target found on CDP 9222'));
        } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

async function runQuantumAudit() {
  const wsUrl = await getTargetWsUrl();
  console.log('[Quantum Browser Agent v52] Connecting via CDP WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];
  const networkFailures = [];

  ws.on('open', async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    try {
      // Enable domains
      await send('Console.enable');
      await send('Network.enable');
      await send('Page.enable');
      await send('Runtime.enable');

      // Clear device metrics override to preserve resolution
      await send('Emulation.clearDeviceMetricsOverride');

      console.log('[Quantum Agent] Navigating tab to https://www.alparai.com/en/ ...');
      const navResult = await send('Page.navigate', { url: 'https://www.alparai.com/en/' });
      
      // Wait 5 seconds for full rendering & network idle
      await new Promise(r => setTimeout(r, 5000));

      // Execute 10-Pillar In-Page Audit via Runtime.evaluate
      const auditResult = await send('Runtime.evaluate', {
        expression: `(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          const overflow = scrollWidth > innerWidth;

          // WCAG touch targets check
          const interactives = Array.from(document.querySelectorAll('a, button, input, select'));
          const smallTargets = interactives.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.width < 32 || rect.height < 32);
          }).length;

          // i18n purity check (mojibake detection)
          const bodyText = document.body.innerText || '';
          const mojibakeMatch = bodyText.match(/(â€|Ã|â€™|â€œ|Ã§|Ã¼|Ã¶|Ä±|ÅŸ|ÄŸ)/g) || [];

          // Core Web Vitals / performance entries
          const perfEntries = performance.getEntriesByType('navigation')[0];
          const domContentLoaded = perfEntries ? Math.round(perfEntries.domContentLoadedEventEnd) : null;
          const loadEvent = perfEntries ? Math.round(perfEntries.loadEventEnd) : null;

          // OpenGraph & Security meta
          const title = document.title;
          const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
          const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
          const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '';

          return JSON.stringify({
            title,
            scrollWidth,
            innerWidth,
            overflow,
            interactiveCount: interactives.length,
            smallTargetsCount: smallTargets,
            mojibakeCount: mojibakeMatch.length,
            domContentLoadedMs: domContentLoaded,
            loadEventMs: loadEvent,
            ogTitle,
            ogImage,
            hasCspMeta: !!cspMeta,
            bodySnippet: bodyText.slice(0, 400).replace(/\\n/g, ' ')
          });
        })()`,
        returnByValue: true
      });

      const auditData = JSON.parse(auditResult.result?.result?.value || '{}');

      // Calculate score out of 1000
      let score = 1000;
      if (consoleErrors.length > 0) score -= consoleErrors.length * 50;
      if (networkFailures.length > 0) score -= networkFailures.length * 50;
      if (auditData.overflow) score -= 150;
      if (auditData.smallTargetsCount > 0) score -= Math.min(100, auditData.smallTargetsCount * 10);
      if (auditData.mojibakeCount > 0) score -= Math.min(150, auditData.mojibakeCount * 15);
      score = Math.max(0, score);

      console.log('\n=================== 🤖 QUANTUM BROWSER AGENT v52 AUDIT REPORT ===================');
      console.log('Target URL:         https://www.alparai.com/en/');
      console.log('Page Title:        ', auditData.title);
      console.log('Console Errors:    ', consoleErrors.length);
      console.log('Network Failures:  ', networkFailures.length);
      console.log('Horizontal Overflow:', auditData.overflow ? `YES (${auditData.scrollWidth}px > ${auditData.innerWidth}px)` : 'NO (100% Clean)');
      console.log('Interactive Links: ', auditData.interactiveCount);
      console.log('Small Touch Targets:', auditData.smallTargetsCount);
      console.log('Mojibake Hits:     ', auditData.mojibakeCount);
      console.log('DOM Content Loaded:', auditData.domContentLoadedMs ? `${auditData.domContentLoadedMs} ms` : 'N/A');
      console.log('Full Page Load:    ', auditData.loadEventMs ? `${auditData.loadEventMs} ms` : 'N/A');
      console.log('Body Text Snippet: ', auditData.bodySnippet);
      console.log('----------------------------------------------------------------------------------');
      console.log(`FINAL QUANTUM SCORE: ${score} / 1000 (Grade: ${score >= 900 ? 'A+' : score >= 750 ? 'B' : 'F'})`);
      console.log('==================================================================================\n');

      ws.close();
    } catch (err) {
      console.error('[Quantum Agent Error]:', err);
      ws.close();
    }
  });

  ws.on('message', (rawData) => {
    try {
      const msg = JSON.parse(rawData);
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
      if (msg.method === 'Console.messageAdded' && msg.params?.message?.level === 'error') {
        consoleErrors.push(msg.params.message.text);
      }
      if (msg.method === 'Network.responseReceived') {
        const status = msg.params.response.status;
        if (status >= 400) {
          networkFailures.push(`${status} ${msg.params.response.url}`);
        }
      }
    } catch (e) {}
  });
}

runQuantumAudit().catch(console.error);
