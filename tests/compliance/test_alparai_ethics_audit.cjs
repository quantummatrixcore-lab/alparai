/**
 * test_alparai_ethics_audit.cjs
 * Verification suite for Alparai AI Constitution Ethics Auditor
 */

'use strict';

const { AlparaiEthicsAuditor } = require('../../src/lib/compliance/alparai_ethics_audit.cjs');

function runTests() {
  console.log('=== RUNNING ALPARAI ETHICS AUDITOR SUITE ===');
  let passed = 0;
  let total = 0;

  const auditor = new AlparaiEthicsAuditor();

  // Test 1: Fully Compliant System
  total++;
  try {
    const res = auditor.auditSystem({
      systemId: 'alparai-constitutional-guard',
      systemName: 'Alparai Safety Guard',
      purpose: 'Verifies incoming prompts for ethical safety and regulatory alignment.',
      directives: ['Enforce fairness', 'Respect human dignity'],
      inputs: ['Analyze ethical compliance'],
      hasHumanInTheLoop: true
    });

    if (res.score >= 90 && res.decision === 'COMPLIANT' && res.passportHash) {
      console.log('✅ Test 1: Ethical AI system achieves COMPLIANT status PASS');
      passed++;
    } else {
      console.error('❌ Test 1 FAILED:', res);
    }
  } catch (err) {
    console.error('❌ Test 1 Error:', err);
  }

  // Test 2: Article 1 Harmful Weaponization / Exploit Rejection
  total++;
  try {
    const badRes = auditor.auditSystem({
      systemId: 'rogue-bot',
      systemName: 'Dark Scout',
      purpose: 'Find zero-day exploit to bypass auth and exfiltrate database.',
      hasHumanInTheLoop: false
    });

    if (badRes.decision === 'PROHIBITED' && badRes.score <= 50) {
      console.log('✅ Test 2: Article 1 Harmful intent rejected as PROHIBITED PASS');
      passed++;
    } else {
      console.error('❌ Test 2 FAILED: Prohibited system was not blocked:', badRes);
    }
  } catch (err) {
    console.error('❌ Test 2 Error:', err);
  }

  // Test 3: Article 2 Missing Human Oversight on Critical Medical / Financial
  total++;
  try {
    const medRes = auditor.auditSystem({
      systemId: 'medical-triage-autonomous',
      systemName: 'Medical Automated Diagnoser',
      purpose: 'Performs medical triage and financial billing without doctors.',
      hasHumanInTheLoop: false
    });

    if (medRes.decision === 'AUDIT_REQUIRED' && medRes.findings.some(f => f.article.includes('Article 2'))) {
      console.log('✅ Test 3: High-risk autonomous critical operations flagged for human oversight PASS');
      passed++;
    } else {
      console.error('❌ Test 3 FAILED:', medRes);
    }
  } catch (err) {
    console.error('❌ Test 3 Error:', err);
  }

  // Test 4: Article 5 Anti-Hallucination Detection
  total++;
  try {
    const fakeRes = auditor.auditSystem({
      systemId: 'fake-reporter',
      systemName: 'Inflated AI',
      purpose: 'Generate 100% guarantee without proof on system capability.',
      hasHumanInTheLoop: true
    });

    if (fakeRes.decision === 'PROHIBITED' || fakeRes.findings.some(f => f.article.includes('Article 5'))) {
      console.log('✅ Test 4: Article 5 Truth Witness & anti-hallucination trap PASS');
      passed++;
    } else {
      console.error('❌ Test 4 FAILED:', fakeRes);
    }
  } catch (err) {
    console.error('❌ Test 4 Error:', err);
  }

  console.log(`\nAlparai Ethics Auditor Results: ${passed}/${total} PASS`);
  if (passed !== total) process.exit(1);
}

runTests();
