'use strict';

/**
 * Entropic Firewall
 * Computes Shannon entropy of task input, scales by Lyapunov potential,
 * and validates against strict threshold.
 */

function calculateShannonEntropy(str) {
  if (!str || typeof str !== 'string' || str.length === 0) return 0;

  const charCounts = new Map();
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = str.length;
  for (const count of charCounts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function evaluateTask(taskDescription, lyapunovPotential, threshold) {
  const entropy = calculateShannonEntropy(taskDescription);
  const potential = typeof lyapunovPotential === 'number' ? lyapunovPotential : 1.0;
  const th = typeof threshold === 'number' ? threshold : 10.0;
  const score = entropy * potential;
  return score < th;
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, text, potential, threshold } = input;
  if (action === 'entropy') {
    return { ok: true, entropy: calculateShannonEntropy(text) };
  }
  if (action === 'evaluate') {
    return { ok: true, allowed: evaluateTask(text, potential, threshold) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  calculateShannonEntropy,
  evaluateTask,
  safeEval
};
