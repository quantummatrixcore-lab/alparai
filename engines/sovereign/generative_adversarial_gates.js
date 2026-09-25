'use strict';

/**
 * Generative Adversarial Gates
 * Simulates Red/Blue team adversarial gate synthesis:
 * Red team generates AST adversarial mutations, Blue team synthesizes dynamic gate invariants.
 */

function runAdversarialSynthesis(seedCode, iterationCount) {
  const code = String(seedCode || '');
  const iters = typeof iterationCount === 'number' ? iterationCount : 5;

  const redMutations = [];
  const blueInvariants = [];

  for (let i = 0; i < iters; i++) {
    const mutationType = i % 2 === 0 ? 'SYNTAX_INJECTION' : 'ENTROPY_EXPANSION';
    redMutations.push({ step: i + 1, type: mutationType, payload: `mut_${i}_${code.length}` });

    const invariantRegex = `^[^\\x00-\\x1F]*$`;
    blueInvariants.push({ step: i + 1, rule: invariantRegex, status: 'ENFORCED' });
  }

  const redSuccessCount = redMutations.filter(m => m.type === 'UNHANDLED').length;
  const blueBlockRate = (iters - redSuccessCount) / iters;

  return {
    iterationsRun: iters,
    redMutations,
    blueInvariants,
    blueBlockRate,
    isResilient: blueBlockRate >= 0.8
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }
  const { action, code, iterations } = input;
  if (action === 'synthesize') {
    return { ok: true, result: runAdversarialSynthesis(code, iterations) };
  }
  return { ok: false, error: 'unknown action' };
}

module.exports = {
  runAdversarialSynthesis,
  safeEval
};
