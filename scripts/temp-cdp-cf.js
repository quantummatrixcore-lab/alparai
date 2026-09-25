import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'cloudflare' });
  
  const fetchScript = `
    (async function() {
      try {
        // Extract Zone ID from URL path or page state
        const pathParts = window.location.pathname.split('/');
        // URL format: /635ead830bc3a409e643b59e3768e9f5/alparai.com/dns/records
        const accountId = pathParts[1];
        const domainName = pathParts[2];

        // Query Cloudflare zones API from logged-in browser context
        const zonesRes = await fetch('/api/v4/zones?name=' + domainName);
        const zonesData = await zonesRes.json();
        const zone = zonesData.result && zonesData.result[0];
        
        if (!zone) {
          return { error: 'Zone not found', zonesData };
        }

        const zoneId = zone.id;
        // Fetch current DNS records for alparai.com
        const recordsRes = await fetch('/api/v4/zones/' + zoneId + '/dns_records?per_page=100');
        const recordsData = await recordsRes.json();

        return {
          accountId,
          domainName,
          zoneId,
          recordCount: recordsData.result ? recordsData.result.length : 0,
          records: recordsData.result ? recordsData.result.map(r => ({ id: r.id, type: r.type, name: r.name, content: r.content, priority: r.priority })) : []
        };
      } catch (e) {
        return { error: e.message };
      }
    })()
  `;
  const res = await agent.send('Runtime.evaluate', { expression: fetchScript, awaitPromise: true, returnByValue: true });
  console.log('CF API Result:', JSON.stringify(res.result?.value, null, 2));
  await agent.disconnect();
}

run().catch(console.error);
