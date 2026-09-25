'use strict';

/**
 * Causal Graph Interferometry
 * Evaluates semantic/temporal interference between parallel execution tasks
 * using quantum wave interference principles: I = 2 * A1 * A2 * cos(theta1 - theta2).
 */

function calculateWaveInterference(amplitude1, phase1, amplitude2, phase2) {
  const a1 = typeof amplitude1 === 'number' ? amplitude1 : 1.0;
  const a2 = typeof amplitude2 === 'number' ? amplitude2 : 1.0;
  const p1 = typeof phase1 === 'number' ? phase1 : 0.0;
  const p2 = typeof phase2 === 'number' ? phase2 : 0.0;

  const phaseDiff = p1 - p2;
  const interference = 2 * a1 * a2 * Math.cos(phaseDiff);
  const totalIntensity = (a1 * a1) + (a2 * a2) + interference;

  const isDestructive = interference < 0;
  const requiresPhaseShift = isDestructive && Math.abs(interference) > 0.5 * (a1 * a1 + a2 * a2);

  return {
    phaseDiff,
    interference,
    totalIntensity: Math.max(0, totalIntensity),
    isDestructive,
    requiresPhaseShift,
    suggestedPhaseCorrection: requiresPhaseShift ? Math.PI / 2 : 0.0
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, a1, p1, a2, p2 } = input;
  if (action === 'interfere') {
    return { ok: true, result: calculateWaveInterference(a1, p1, a2, p2) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  calculateWaveInterference,
  safeEval
};
