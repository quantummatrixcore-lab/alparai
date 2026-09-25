/**
 * scripts/inspect_dns_edit_modal.cjs
 * Inspects Edit buttons and row structure on Cloudflare DNS page.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/A101186203842C5660F6F97D10817F3B');

ws.on('open', () => {
  const code = `(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr, [role="row"]'));
    const alparRows = rows.filter(r => {
      const text = r.innerText || '';
      return text.includes('45.143.4.92');
    });

    const details = alparRows.map(r => {
      const buttons = Array.from(r.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label')
      }));
      return {
        rowText: r.innerText.trim().replace(/\\n+/g, ' | '),
        buttons
      };
    });

    return {
      matchingRows: details
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: code, returnByValue: true }
  }));
});

ws.on('message', (d) => {
  console.log(JSON.stringify(JSON.parse(d).result?.result?.value, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
