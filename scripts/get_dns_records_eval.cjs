const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const text = document.body.innerText || '';
    
    // Find rows or elements containing DNS records
    const rows = Array.from(document.querySelectorAll('table tbody tr, tr, [role=\"row\"]'));
    const dnsRecords = rows.map(r => {
      const cells = Array.from(r.querySelectorAll('td, th, [role=\"cell\"], [role=\"gridcell\"]')).map(c => c.innerText.trim());
      return cells;
    }).filter(c => c.length >= 2);

    const nameservers = text.match(/([a-z0-9-]+\\.ns\\.cloudflare\\.com)/gi);

    return {
      title: document.title,
      records: dnsRecords,
      nameservers: nameservers ? Array.from(new Set(nameservers)) : [],
      textSnippet: text.slice(0, 3000)
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
