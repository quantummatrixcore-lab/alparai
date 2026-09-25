import { describe, test, expect } from "vitest";
import { AlparShieldEngine, ShieldVerificationInput } from "../src/lib/security/alpar-shield";

describe("ALPAR AI Transparent Shield Engine (Anti-Bot Verification)", () => {
  test("1. Natural Human Kinetic Interaction -> ALLOWED (Pass)", () => {
    // Generate organic human trajectory with micro-jitter and curved angles
    const humanTrajectory = [];
    let x = 100, y = 100, t = Date.now();
    for (let i = 0; i < 20; i++) {
      x += 15 + Math.random() * 8;
      y += 10 + Math.sin(i / 2) * 12 + (Math.random() * 4);
      t += 25 + Math.random() * 15;
      humanTrajectory.push({ x, y, timestamp: t, isTrusted: true });
    }

    const input: ShieldVerificationInput = {
      fingerprint: "fp_human_test_001",
      trajectory: humanTrajectory,
      clickEvent: {
        targetId: "btn-submit-incident",
        isTrusted: true,
        dwellTimeMs: 85, // Human dwell time
        cdpFlagDetected: false
      }
    };

    const result = AlparShieldEngine.verifyInteraction(input);

    expect(result.allowed).toBe(true);
    expect(result.riskScore).toBeLessThan(50);
    expect(result.trustScore).toBeGreaterThan(50);
    expect(result.reason).toBe("HUMAN_KINETICS_VERIFIED");
    expect(result.merkleProofHash).toHaveLength(96); // SHA-384 hex length
  });

  test("2. CDP Synthetic Untrusted Click -> DENIED (Blocked)", () => {
    const input: ShieldVerificationInput = {
      fingerprint: "fp_bot_cdp_002",
      trajectory: [{ x: 500, y: 300, timestamp: Date.now() }], // Teleport click
      clickEvent: {
        targetId: "btn-submit-incident",
        isTrusted: false, // Untrusted CDP click
        dwellTimeMs: 0,   // Instant synthetic click
        cdpFlagDetected: true
      }
    };

    const result = AlparShieldEngine.verifyInteraction(input);

    expect(result.allowed).toBe(false);
    expect(result.riskScore).toBeGreaterThanOrEqual(80);
    expect(result.trustScore).toBeLessThanOrEqual(20);
    expect(result.reason).toContain("UNTRUSTED_EVENT_FLAG");
    expect(result.reason).toContain("CDP_SYNTHETIC_CLICK_DETECTED");
  });

  test("3. Linear Low-Entropy Algorithmic Bot Trajectory -> DENIED (Blocked)", () => {
    // Perfectly straight line, zero jitter (computer generated)
    const linearTrajectory = [];
    let t = Date.now();
    for (let i = 0; i < 20; i++) {
      linearTrajectory.push({ x: 100 + i * 10, y: 100 + i * 10, timestamp: t + i * 10, isTrusted: true });
    }

    const input: ShieldVerificationInput = {
      fingerprint: "fp_linear_bot_003",
      trajectory: linearTrajectory,
      clickEvent: {
        targetId: "btn-submit-incident",
        isTrusted: true,
        dwellTimeMs: 5, // Impossible human dwell time
        cdpFlagDetected: false
      }
    };

    const result = AlparShieldEngine.verifyInteraction(input);

    expect(result.allowed).toBe(false);
    expect(result.riskScore).toBeGreaterThanOrEqual(50);
  });
});
