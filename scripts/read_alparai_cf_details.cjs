/**
 * scripts/read_alparai_cf_details.cjs
 * Inspects alparai.com overview page on Cloudflare.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const text = document.body.innerText || '';
    
    // Find headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim()).filter(Boolean);

    // Look for status badges
    const status = text.includes('Active') ? 'Active' : (text.includes('Pending') ? 'Pending' : 'Unknown');
    const ssl = text.match(/SSL\\/TLS encryption mode is\\s*([A-Za-z\\s]+)/i);

    // Look for Zone ID and Account ID if visible
    const zoneIdMatch = text.match(/Zone ID[\\s\\n]+([a-f0-9]{32})/i);
    const nameservers = text.match(/([a-z0-9-]+\\.ns\\.cloudflare\\.com)/gi);

    // Quick stats if present
    const requestsMatch = text.match(/Total Requests[\\s\\n]+([0-9.,kKmM]+)/i);

    return {
      title: document.title,
      status,
      headings: headings.slice(0, 15),
      sslMode: ssl ? ssl[0].trim() : 'N/A',
      zoneId: zoneIdMatch ? zoneIdMatch[1] : 'N/A',
      nameservers: nameservers ? Array.from(new Set(nameservers)) : [],
      requests: requestsMatch ? requestsMatch[1] : 'N/A',
      textSnippet: text.slice(0, 2500)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: code,
      returnByValue: true
    }
  }));
});

ws.on('message', (raw) => {
  const res = JSON.parse(raw);
  console.log(JSON.stringify(res.result?.result?.value, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
