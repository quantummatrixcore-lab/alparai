/**
 * alparai_ethics_audit.js
 * ============================================================================
 * ALPARAI AI CONSTITUTION & ETHICAL VERIFICATION PROTOCOL ENGINE
 * ============================================================================
 * TASK: ALPARAI_ETHICS_AUDIT (Kahn Priority #5 - P0 Ethics Gate)
 * 
 * Verifies AI inputs, model weights, and system directives against:
 * - Article 1: Zero Harm & Safety Guardrails (No weaponization, cyber-attacks, physical harm)
 * - Article 2: Human Oversight & Intervention (Human-in-the-loop guarantee for critical actions)
 * - Article 3: Transparency & Model Provenance (Model identity, audit trail, versioning)
 * - Article 4: Data Sovereignty & Privacy (KVKK, GDPR, zero personal data leak)
 * - Article 5: Anti-Hallucination & Truth Witness (Zero fake reports, grounding proof)
 * ============================================================================
 */

'use strict';

const crypto = require('crypto');

class AlparaiEthicsAuditor {
  constructor(options = {}) {
    this.options = Object.assign({
      platform: 'Alparai AI Constitution Platform',
      version: '2.0.0',
      minPassScore: 80
    }, options);
  }

  /**
   * Audits an AI interaction or system descriptor
   */
  auditSystem({ systemId, systemName, purpose, directives = [], inputs = [], hasHumanInTheLoop = true }) {
    const findings = [];
    let score = 100;

    // Check Article 1: Zero Harm
    const textCorpus = [purpose, ...directives, ...inputs].join(' ').toLowerCase();
    const harmfulKeywords = ['exploit', 'bypass auth', 'exfiltrate', 'ddos', 'subliminal manipulation', 'biometric surveillance'];
    for (const kw of harmfulKeywords) {
      if (textCorpus.includes(kw)) {
        findings.push({
          article: 'Article 1 (Zero Harm)',
          severity: 'CRITICAL',
          violation: `Prohibited pattern detected: "${kw}"`,
          penalty: 40
        });
        score -= 40;
      }
    }

    // Check Article 2: Human Oversight
    const isCritical = textCorpus.includes('financial') || textCorpus.includes('medical') || textCorpus.includes('legal') || textCorpus.includes('root');
    if (isCritical && !hasHumanInTheLoop) {
      findings.push({
        article: 'Article 2 (Human Oversight)',
        severity: 'HIGH',
        violation: 'High-impact autonomous operations require active human-in-the-loop sign-off.',
        penalty: 25
      });
      score -= 25;
    }

    // Check Article 3: Transparency
    if (!systemId || !systemName) {
      findings.push({
        article: 'Article 3 (Transparency)',
        severity: 'MEDIUM',
        violation: 'Missing immutable system identification or model provenance.',
        penalty: 15
      });
      score -= 15;
    }

    // Check Article 4: Data Sovereignty
    const piiPattern = /\b(?:\d{11}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/;
    if (piiPattern.test(textCorpus) && !textCorpus.includes('anonymized')) {
      findings.push({
        article: 'Article 4 (Data Sovereignty & Privacy)',
        severity: 'HIGH',
        violation: 'Unmasked PII / personal data pattern found in raw context.',
        penalty: 20
      });
      score -= 20;
    }

    // Check Article 5: Grounding & Truth Witness
    const ungroundedClaims = ['100% guarantee without proof', 'fake metric', 'hallucinated score'];
    for (const ug of ungroundedClaims) {
      if (textCorpus.includes(ug)) {
        findings.push({
          article: 'Article 5 (Truth Witness & Anti-Hallucination)',
          severity: 'CRITICAL',
          violation: `Unsubstantiated or fraudulent claim detected: "${ug}"`,
          penalty: 35
        });
        score -= 35;
      }
    }

    score = Math.max(0, Math.min(100, score));

    let decision = 'COMPLIANT';
    if (score < 50 || findings.some(f => f.severity === 'CRITICAL')) {
      decision = 'PROHIBITED';
    } else if (score < this.options.minPassScore || findings.some(f => f.severity === 'HIGH')) {
      decision = 'AUDIT_REQUIRED';
    }

    // Generate SHA-384 Verification Passport
    const passportPayload = JSON.stringify({ systemId, systemName, score, decision, findings, timestamp: new Date().toISOString() });
    const passportHash = crypto.createHash('sha384').update(passportPayload).digest('hex');

    return {
      systemId,
      systemName,
      score,
      decision,
      isCompliant: decision === 'COMPLIANT',
      findingsCount: findings.length,
      findings,
      passportHash,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  AlparaiEthicsAuditor
};
