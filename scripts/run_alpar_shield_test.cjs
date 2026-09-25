'use strict';
/**
 * run_alpar_shield_test.cjs
 * Verification test for ALPAR AI Shield Engine
 */

const crypto = require('crypto');

class AlparShieldEngine {
  static calculateKineticEntropy(trajectory) {
    if (!trajectory || trajectory.length < 3) return 0;
    let totalAngleChange = 0;
    let velocityChanges = 0;

    for (let i = 2; i < trajectory.length; i++) {
      const p1 = trajectory[i - 2];
      const p2 = trajectory[i - 1];
      const p3 = trajectory[i];

      const dt1 = Math.max(1, p2.timestamp - p1.timestamp);
      const dt2 = Math.max(1, p3.timestamp - p2.timestamp);

      const v1 = Math.hypot(p2.x - p1.x, p2.y - p1.y) / dt1;
      const v2 = Math.hypot(p3.x - p2.x, p3.y - p2.y) / dt2;

      velocityChanges += Math.abs(v2 - v1);

      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      totalAngleChange += Math.abs(angle2 - angle1);
    }

    const avgVelocityChange = velocityChanges / (trajectory.length - 2);
    const avgAngleChange = totalAngleChange / (trajectory.length - 2);

    return (avgAngleChange * 2.5) + (avgVelocityChange * 1.5);
  }

  static verifyInteraction(input) {
    const timestamp = new Date().toISOString();
    let riskScore = 0;
    let reasons = [];

    if (input.clickEvent && !input.clickEvent.isTrusted) {
      riskScore += 65;
      reasons.push("UNTRUSTED_EVENT_FLAG");
    }

    if (input.clickEvent && input.clickEvent.cdpFlagDetected) {
      riskScore += 80;
      reasons.push("CDP_SYNTHETIC_CLICK_DETECTED");
    }

    if (input.clickEvent && input.clickEvent.dwellTimeMs < 10) {
      riskScore += 40;
      reasons.push("IMPOSSIBLE_HUMAN_DWELL_TIME");
    }

    const entropy = this.calculateKineticEntropy(input.trajectory);
    if (entropy === 0 && input.trajectory.length > 5) {
      riskScore += 50;
      reasons.push("PERFECTLY_LINEAR_BOT_TRAJECTORY");
    }

    if (input.trajectory.length < 2) {
      riskScore += 35;
      reasons.push("ZERO_TRAJECTORY_TELEPORT_CLICK");
    }

    const finalRiskScore = Math.min(100, riskScore);
    const trustScore = Math.max(0, 100 - finalRiskScore);
    const allowed = finalRiskScore < 50;
    const finalReason = allowed ? "HUMAN_KINETICS_VERIFIED" : reasons.join(" | ");

    const payload = `${input.fingerprint || 'anonymous'}:${trustScore}:${finalRiskScore}:${finalReason}:${timestamp}`;
    const merkleProofHash = crypto.createHash('sha384').update(payload).digest('hex');

    return {
      allowed,
      trustScore,
      riskScore: finalRiskScore,
      reason: finalReason,
      merkleProofHash,
      verifiedAt: timestamp
    };
  }
}

// RUN TESTS
console.log('===============================================================');
console.log('🛡️  ALPAR AI TRANSPARENT SHIELD: DOĞRULAMA DİZİSİ ÇALIŞTIRILIYOR');
console.log('===============================================================');

// Test 1: Real Human
const humanTrajectory = [];
let x = 100, y = 100, t = Date.now();
for (let i = 0; i < 20; i++) {
  x += 15 + Math.random() * 8;
  y += 10 + Math.sin(i / 2) * 12 + (Math.random() * 4);
  t += 25 + Math.random() * 15;
  humanTrajectory.push({ x, y, timestamp: t, isTrusted: true });
}

const res1 = AlparShieldEngine.verifyInteraction({
  fingerprint: 'fp_human_test_001',
  trajectory: humanTrajectory,
  clickEvent: { targetId: 'btn-submit', isTrusted: true, dwellTimeMs: 85 }
});

console.log('TEST 1 (İnsan Tıklaması):', res1.allowed ? '✅ İZİN VERİLDİ (PASS)' : '❌ REDDEDİLDİ');
console.log(`   TrustScore: ${res1.trustScore}/100 | RiskScore: ${res1.riskScore}/100 | Sebebi: ${res1.reason}`);
console.log(`   SHA-384 Proof: ${res1.merkleProofHash.slice(0, 32)}...`);

if (!res1.allowed) throw new Error("Test 1 Failed");

// Test 2: CDP Bot Attack (Untrusted + CDP Flag)
const res2 = AlparShieldEngine.verifyInteraction({
  fingerprint: 'fp_bot_cdp_002',
  trajectory: [{ x: 500, y: 300, timestamp: Date.now() }],
  clickEvent: { targetId: 'btn-submit', isTrusted: false, dwellTimeMs: 0, cdpFlagDetected: true }
});

console.log('\nTEST 2 (Quantum/CDP Bot Saldırısı):', !res2.allowed ? '✅ BAŞARIYLA ENGELLEDİ (PASS)' : '❌ HATA: BOTA İZİN VERİLDİ');
console.log(`   TrustScore: ${res2.trustScore}/100 | RiskScore: ${res2.riskScore}/100 | Engelleme Nedeni: ${res2.reason}`);

if (res2.allowed) throw new Error("Test 2 Failed");

// Test 3: Perfectly Linear Computer-Generated Bot
const linearTrajectory = [];
let t2 = Date.now();
for (let i = 0; i < 15; i++) {
  linearTrajectory.push({ x: 100 + i * 10, y: 100 + i * 10, timestamp: t2 + i * 10, isTrusted: true });
}

const res3 = AlparShieldEngine.verifyInteraction({
  fingerprint: 'fp_linear_bot_003',
  trajectory: linearTrajectory,
  clickEvent: { targetId: 'btn-submit', isTrusted: true, dwellTimeMs: 2 }
});

console.log('\nTEST 3 (Çizgisel Algoritmik Bot Saldırısı):', !res3.allowed ? '✅ BAŞARIYLA ENGELLEDİ (PASS)' : '❌ HATA: BOTA İZİN VERİLDİ');
console.log(`   TrustScore: ${res3.trustScore}/100 | RiskScore: ${res3.riskScore}/100 | Engelleme Nedeni: ${res3.reason}`);

if (res3.allowed) throw new Error("Test 3 Failed");

console.log('\n===============================================================');
console.log('🎉 TÜM SHIELD KORUMA TESTLERİ %100 YEŞİL ONAYLA TAMAMLANDI!');
console.log('===============================================================');
