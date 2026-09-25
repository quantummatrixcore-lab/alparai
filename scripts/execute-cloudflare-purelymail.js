import QuantumBrowserAgent from 'file:///D:/02_Yapay_Zeka_Motorlari/Antigravity/engines/v52_quantum_browser_agent.js';

async function run() {
  const agent = new QuantumBrowserAgent({ cdpPort: 9222, speedMode: 'WARP' });
  await agent.connect({ urlMatch: 'cloudflare' });

  const zoneId = 'ec964807cf91eb929754c9895fcd074c';
  const ownershipProof = 'purelymail_ownership_proof=4420860b2d3fd4f4ec9e39f829f13722669a435ab37139f5e90f33bc3eb9d9993ea990a0204af5549b4ef881e215abc8271fc4f30c5a5bfcc02f206f5cd53053';

  console.log('--- STARTING ATOMIC CLOUDFLARE DNS MUTATION FOR PURELYMAIL + RESEND ---');

  const script = `
    (async function() {
      const zoneId = '${zoneId}';
      const results = [];

      // 1. Delete old Zoho MX records
      const oldMxIds = ['8c3572cff95ccaec65146d8f398fd38d', 'eaab35639f822f849fd90a0f5c334864', 'e78cd0d97148985d720214cabe48a388'];
      for (const id of oldMxIds) {
        try {
          const res = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + id, { method: 'DELETE' });
          const data = await res.json();
          results.push({ action: 'delete_old_mx', id, success: data.success });
        } catch (e) {
          results.push({ action: 'delete_old_mx', id, error: e.message });
        }
      }

      // 2. Add Purelymail MX
      try {
        const res = await fetch('/api/v4/zones/' + zoneId + '/dns_records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'MX',
            name: 'alparai.com',
            content: 'mailserver.purelymail.com',
            priority: 10,
            ttl: 1
          })
        });
        const data = await res.json();
        results.push({ action: 'add_purelymail_mx', success: data.success, errors: data.errors });
      } catch (e) {
        results.push({ action: 'add_purelymail_mx', error: e.message });
      }

      // 3. Update SPF TXT
      try {
        const spfId = 'b7fe90f65713f23404e7be6853d4b9b3';
        const res = await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + spfId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TXT',
            name: 'alparai.com',
            content: 'v=spf1 include:_spf.purelymail.com include:resend.com ~all',
            ttl: 1
          })
        });
        const data = await res.json();
        results.push({ action: 'update_spf', success: data.success, errors: data.errors });
      } catch (e) {
        results.push({ action: 'update_spf', error: e.message });
      }

      // 4. Add Purelymail Ownership TXT
      try {
        const res = await fetch('/api/v4/zones/' + zoneId + '/dns_records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TXT',
            name: 'alparai.com',
            content: '${ownershipProof}',
            ttl: 1
          })
        });
        const data = await res.json();
        results.push({ action: 'add_ownership_proof', success: data.success, errors: data.errors });
      } catch (e) {
        results.push({ action: 'add_ownership_proof', error: e.message });
      }

      // 5. Add Purelymail DKIM CNAME records
      const dkimRecords = [
        { name: 'purelymail1._domainkey.alparai.com', content: 'key1.dkimroot.purelymail.com' },
        { name: 'purelymail2._domainkey.alparai.com', content: 'key2.dkimroot.purelymail.com' },
        { name: 'purelymail3._domainkey.alparai.com', content: 'key3.dkimroot.purelymail.com' }
      ];

      for (const dkim of dkimRecords) {
        try {
          const res = await fetch('/api/v4/zones/' + zoneId + '/dns_records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'CNAME',
              name: dkim.name,
              content: dkim.content,
              ttl: 1
            })
          });
          const data = await res.json();
          results.push({ action: 'add_dkim_' + dkim.name, success: data.success, errors: data.errors });
        } catch (e) {
          results.push({ action: 'add_dkim_' + dkim.name, error: e.message });
        }
      }

      return results;
    })()
  `;

  const res = await agent.send('Runtime.evaluate', { expression: script, awaitPromise: true, returnByValue: true });
  console.log('CF Mutation Results:', JSON.stringify(res.result?.value, null, 2));

  await agent.disconnect();
}

run().catch(console.error);
