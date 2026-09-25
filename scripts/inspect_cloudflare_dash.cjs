/**
 * scripts/inspect_cloudflare_dash.cjs
 * Safely inspects the active Cloudflare Dashboard tab via CDP WebSocket port 9222.
 * Zero New Tab / Zero Desktop Disruption.
 */

const http = require('http');

function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const tabs = JSON.parse(data);
          const tab = tabs.find(t => t.url.includes('dash.cloudflare.com') || t.id === 'A101186203842C5660F6F97D10817F3B');
          if (tab && tab.webSocketDebuggerUrl) {
            resolve(tab.webSocketDebuggerUrl);
          } else {
            reject(new Error('Cloudflare tab not found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const wsUrl = await getWsUrl();
  console.log('Connecting to:', wsUrl);

  const WebSocket = require('ws');
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    // Send Runtime.evaluate to inspect page contents
    const script = `(() => {
      const title = document.title;
      const h1s = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean);
      
      // Look for domains / websites
      const links = Array.from(document.querySelectorAll('a[href*="/domains/"], a[href*="/overview"], [data-testid*="zone"], table tr, ul li'))
        .map(el => el.innerText.trim())
        .filter(t => t.includes('.com') || t.includes('.ai') || t.includes('.org') || t.includes('Active') || t.includes('Pending'));

      // Check text in main container
      const main = document.querySelector('main') || document.body;
      const textSample = (main ? main.innerText : '').slice(0, 3000);

      // Buttons or call to actions
      const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'))
        .map(b => b.innerText.trim())
        .filter(b => b.length > 1 && b.length < 50)
        .slice(0, 20);

      return {
        title,
        h1s: h1s.slice(0, 10),
        domainsOrRows: links.slice(0, 15),
        buttons: Array.from(new Set(buttons)),
        textSample
      };
    })()`;

    const msg = {
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: script,
        returnByValue: true
      }
    };
    ws.send(JSON.stringify(msg));
  });

  ws.on('message', (raw) => {
    const res = JSON.parse(raw);
    if (res.id === 1) {
      if (res.result && res.result.result) {
        console.log('--- CLOUDFLARE DASHBOARD INSPECTION ---');
        console.log(JSON.stringify(res.result.result.value, null, 2));
      } else {
        console.error('Evaluation failed:', res);
      }
      ws.close();
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    process.exit(1);
  });
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
