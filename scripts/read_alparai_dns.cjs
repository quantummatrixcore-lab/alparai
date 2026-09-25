/**
 * scripts/read_alparai_dns.cjs
 * Navigates to alparai.com DNS Records page and extracts DNS entries.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

ws.on('open', async () => {
  console.log('Navigating active tab to alparai.com DNS records...');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.navigate',
    params: {
      url: 'https://dash.cloudflare.com/635ead830bc3a409e643b59e3768e9f5/alparai.com/dns/records'
    }
  }));

  await sleep(4000);

  const script = `(() => {
    // Find table rows
    const rows = Array.from(document.querySelectorAll('table tbody tr, [role=\"row\"]'));
    const dnsRecords = rows.map(r => {
      const cells = Array.from(r.querySelectorAll('td, [role=\"cell\"], [role=\"gridcell\"]')).map(c => c.innerText.trim());
      return cells;
    }).filter(c => c.length >= 3);

    // Also look for nameservers displayed on the DNS page
    const text = document.body.innerText || '';
    const nsMatches = text.match(/([a-z0-9-]+\\.ns\\.cloudflare\\.com)/gi);

    return {
      title: document.title,
      recordCount: dnsRecords.length,
      records: dnsRecords,
      nameservers: nsMatches ? Array.from(new Set(nsMatches)) : [],
      dnsTextSnippet: text.slice(0, 3000)
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
    console.log('--- ALPARAI.COM DNS RECORDS ---');
    console.log(JSON.stringify(res.result?.result?.value, null, 2));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
