/**
 * scripts/navigate_alparai_cf.cjs
 * Navigates active Cloudflare tab to alparai.com and inspects its status.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

ws.on('open', async () => {
  console.log('Navigating active tab to alparai.com...');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: {
      url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/alparai.com'
    }
  }));

  // Wait for navigation and React SPA render
  await sleep(4000);

  const script = `(() => {
    const title = document.title;
    const bodyText = document.body.innerText || '';
    
    // Find status badges, quick actions, SSL/TLS mode, DNS status
    const statusBadges = Array.from(document.querySelectorAll('[class*=\"status\"], [class*=\"badge\"], [role=\"status\"]'))
      .map(el => el.innerText.trim())
      .filter(Boolean);

    // Look for domain overview cards
    const cards = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
      .map(h => h.innerText.trim())
      .filter(Boolean);

    // Look for quick text snippets
    const sslMatch = bodyText.match(/(?:SSL\\/TLS encryption mode is|Your SSL\\/TLS encryption mode is)\\s*([A-Za-z\\s]+)/i);
    const dnsStatus = bodyText.includes('Active') ? 'Active' : (bodyText.includes('Pending') ? 'Pending' : 'Unknown');

    // Navigation links
    const navLinks = Array.from(document.querySelectorAll('a[href*=\"/alparai.com/\"]'))
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(a => a.text.length > 0 && a.text.length < 40);

    return {
      title,
      headings: cards.slice(0, 15),
      statusBadges: statusBadges.slice(0, 10),
      sslMode: sslMatch ? sslMatch[0] : 'Not detected directly',
      dnsStatus,
      navLinks: navLinks.slice(0, 15),
      sampleText: bodyText.slice(0, 1500)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: {
      expression: script,
      returnByValue: true
    }
  }));
});

ws.on('message', (raw) => {
  const res = JSON.parse(raw);
  if (res.id === 2) {
    console.log('--- ALPARAI.COM CLOUDFLARE OVERVIEW ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
