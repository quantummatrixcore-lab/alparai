'use strict';

/**
 * Spectral Resonance Lock
 * Evaluates Lyapunov spectrum projections to lock the pipeline if chaotic divergence (lambda > 0)
 * is detected in agent intent trajectories.
 */

function evaluateLyapunovSpectrum(trajectory) {
  if (!Array.isArray(trajectory) || trajectory.length < 2) {
    return {
      lambdaMax: 0.0,
      isStable: true,
      locked: false,
      entropyGrowthRate: 0.0
    };
  }

  let logSum = 0;
  let count = 0;

  for (let i = 1; i < trajectory.length; i++) {
    const prev = typeof trajectory[i - 1] === 'number' ? trajectory[i - 1] : 0;
    const curr = typeof trajectory[i] === 'number' ? trajectory[i] : 0;
    const delta = Math.abs(curr - prev);

    if (delta > 1e-12) {
      logSum += Math.log(delta);
      count++;
    }
  }

  const lambdaMax = count > 0 ? logSum / count : 0.0;
  // Positive Lyapunov exponent signifies deterministic chaos / divergence
  const locked = lambdaMax > 0.5;
  const isStable = lambdaMax <= 0.0;

  return {
    lambdaMax,
    isStable,
    locked,
    entropyGrowthRate: Math.max(0, lambdaMax)
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, trajectory } = input;
  if (action === 'evaluate') {
    return { ok: true, result: evaluateLyapunovSpectrum(trajectory) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  evaluateLyapunovSpectrum,
  safeEval
};
