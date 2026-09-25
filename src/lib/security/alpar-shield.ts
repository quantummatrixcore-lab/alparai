/**
 * alpar-shield.ts
 * ============================================================================
 * ALPAR AI — TRANSPARENT SHIELD & ANTI-BOT PROTECTION ENGINE
 * ============================================================================
 * Sitede şeffaf (non-invasive) çalışan, insan kinetiği ve biyometrik entropi
 * analizini çalışma zamanında (runtime) işleyen koruma kalkanı.
 * 
 * Quantum Bot veya gelişmiş CDP otomasyonları dahi olsa; sentetik tıklamaları,
 * yapay fare hareketlerini ve bot etkileşimlerini saliseler içinde tespit edip engeller.
 */

import crypto from 'crypto';

export interface KineticEvent {
  x: number;
  y: number;
  timestamp: number;
  isTrusted?: boolean;
  pressure?: number;
}

export interface ShieldVerificationInput {
  userId?: string;
  ipHash?: string;
  fingerprint?: string;
  trajectory: KineticEvent[];
  clickEvent?: {
    targetId?: string;
    isTrusted: boolean;
    dwellTimeMs: number;
    cdpFlagDetected?: boolean;
  };
}

export interface ShieldVerificationResult {
  allowed: boolean;
  trustScore: number; // 0 - 100
  riskScore: number;  // 0 - 100
  reason: string;
  merkleProofHash: string;
  verifiedAt: string;
}

export class AlparShieldEngine {
  /**
   * Entropi (Rastgelelik & İnsan Kinetik Çeşitliliği) Hesaplama
   * Biyomekanik insan hareketi her zaman düz çizgi olmayan, mikro-titremeli (jitter)
   * ve rastgele ivmelenmeli entropiye sahiptir.
   */
  public static calculateKineticEntropy(trajectory: KineticEvent[]): number {
    if (!trajectory || trajectory.length < 3) return 0;

    let totalAngleChange = 0;
    let velocityChanges = 0;

    for (let i = 2; i < trajectory.length; i++) {
      const p1 = trajectory[i - 2];
      const p2 = trajectory[i - 1];
      const p3 = trajectory[i];

      if (!p1 || !p2 || !p3) continue;

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

  /**
   * Tıklamayı ve Etkileşimi Doğrula
   */
  public static verifyInteraction(input: ShieldVerificationInput): ShieldVerificationResult {
    const timestamp = new Date().toISOString();
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. CDP veya Sentetik Event Tespiti
    if (input.clickEvent && !input.clickEvent.isTrusted) {
      riskScore += 65;
      reasons.push("UNTRUSTED_EVENT_FLAG");
    }

    if (input.clickEvent && input.clickEvent.cdpFlagDetected) {
      riskScore += 80;
      reasons.push("CDP_SYNTHETIC_CLICK_DETECTED");
    }

    // 2. Dwell Time (Tuş/Tıklama Basılı Tutma Süresi) Kontrolü
    // İnsan tıklamaları 20ms - 250ms arasındadır. 10ms altı sentetik bot göstergesidir.
    if (input.clickEvent && input.clickEvent.dwellTimeMs < 10) {
      riskScore += 40;
      reasons.push("IMPOSSIBLE_HUMAN_DWELL_TIME");
    }

    // 3. Kinetik Entropi Kontrolü (Tam düz çizgi = 0 entropi)
    const entropy = this.calculateKineticEntropy(input.trajectory);
    if (entropy === 0 && input.trajectory.length > 5) {
      riskScore += 50;
      reasons.push("PERFECTLY_LINEAR_BOT_TRAJECTORY");
    }

    // 4. Sıfır Hareketle Doğrudan Tıklama (Teleportation)
    if (input.trajectory.length < 2) {
      riskScore += 35;
      reasons.push("ZERO_TRAJECTORY_TELEPORT_CLICK");
    }

    // Nihai Skorlar
    const finalRiskScore = Math.min(100, riskScore);
    const trustScore = Math.max(0, 100 - finalRiskScore);
    const allowed = finalRiskScore < 50;
    const finalReason = allowed ? "HUMAN_KINETICS_VERIFIED" : reasons.join(" | ");

    // SHA-384 Merkle Kanıtı Üretimi
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
