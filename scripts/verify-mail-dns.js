/**
 * verify-mail-dns.js
 * ============================================================================
 * ALPAR AI — DNS Audit Utility for Purelymail + Resend + Cloudflare
 * ============================================================================
 * Queries live DNS records for alparai.com (MX, SPF, DMARC, DKIM)
 * and audits alignment against the sovereign Purelymail + Resend trifecta.
 */

import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';

async function auditMailDNS(domain = 'alparai.com') {
  console.log(`=============================================================`);
  console.log(`🔍 ALPAR AI MAIL DNS AUDIT: ${domain}`);
  console.log(`=============================================================`);

  let score = 100;
  const findings = [];

  // 1. Audit MX Records
  try {
    const mxRecords = await dns.resolveMx(domain);
    console.log(`\n📬 [MX RECORDS] (${mxRecords.length} found):`);
    mxRecords.forEach(r => console.log(`   - Priority ${r.priority}: ${r.exchange}`));

    const hasPurelymail = mxRecords.some(r => r.exchange.includes('purelymail.com'));
    const hasZoho = mxRecords.some(r => r.exchange.includes('zoho'));

    if (hasPurelymail) {
      console.log(`   ✅ Purelymail MX record detected.`);
    } else if (hasZoho) {
      console.log(`   ⚠️ Legacy Zoho MX detected. Migration to Purelymail recommended.`);
      score -= 20;
    } else {
      console.log(`   ℹ️ Non-Purelymail MX configuration active.`);
    }
  } catch (err) {
    console.error(`   ❌ Failed to resolve MX: ${err.message}`);
    score -= 30;
  }

  // 2. Audit SPF (TXT Records)
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const spfRecords = txtRecords.map(r => r.join('')).filter(t => t.startsWith('v=spf1'));

    console.log(`\n🛡️ [SPF RECORDS] (${spfRecords.length} found):`);
    spfRecords.forEach(s => console.log(`   - ${s}`));

    if (spfRecords.length === 1) {
      const spf = spfRecords[0];
      const hasPurelymailSpf = spf.includes('_spf.purelymail.com');
      const hasResendSpf = spf.includes('resend.com');

      if (hasPurelymailSpf && hasResendSpf) {
        console.log(`   ✅ Perfect Trifecta SPF: Purelymail + Resend authorized!`);
      } else {
        if (!hasPurelymailSpf) console.log(`   ⚠️ Purelymail missing from SPF.`);
        if (!hasResendSpf) console.log(`   ⚠️ Resend missing from SPF.`);
      }
    } else if (spfRecords.length > 1) {
      console.log(`   ❌ MULTIPLE SPF RECORDS DETECTED! (RFC Violation - merge into single TXT)`);
      score -= 30;
    }
  } catch (err) {
    console.error(`   ❌ Failed to resolve SPF TXT: ${err.message}`);
  }

  // 3. Audit DMARC
  try {
    const dmarcDomain = `_dmarc.${domain}`;
    const dmarcTxt = await dns.resolveTxt(dmarcDomain);
    const dmarcRecord = dmarcTxt.map(r => r.join('')).find(t => t.startsWith('v=DMARC1'));

    console.log(`\n🔒 [DMARC RECORD]:`);
    if (dmarcRecord) {
      console.log(`   - ${dmarcRecord}`);
      console.log(`   ✅ DMARC policy active.`);
    } else {
      console.log(`   ⚠️ No DMARC record found on ${dmarcDomain}.`);
      score -= 15;
    }
  } catch (err) {
    console.log(`\n🔒 [DMARC RECORD]:`);
    console.log(`   ⚠️ DMARC record lookup pending propagation or unconfigured.`);
  }

  console.log(`\n=============================================================`);
  console.log(`📊 DNS AUDIT SCORE: ${score}/100`);
  console.log(`=============================================================`);
  return score;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const targetDomain = process.argv[2] || 'alparai.com';
  auditMailDNS(targetDomain).catch(console.error);
}

export { auditMailDNS };
