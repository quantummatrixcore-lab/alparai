'use strict';

/**
 * Ghost Gate - Pre-Mortem Oracle
 * Predicts which quality gates might trigger on a given task description.
 */

const GATES = [
  { id: 'Gate_01_Shannon', regex: /information|entropy|compress|encode|bandwidth/i, description: 'Shannon Information Entropy Gate' },
  { id: 'Gate_02_Lyapunov', regex: /chaos|stability|dynamic|diverge|nonlinear/i, description: 'Lyapunov Stability Gate' },
  { id: 'Gate_03_MinHash', regex: /similarity|jaccard|overlap|duplicate|set/i, description: 'MinHash Similarity Gate' },
  { id: 'Gate_04_Turing', regex: /compute|halt|decidable|infinite|loop/i, description: 'Turing Completeness Gate' },
  { id: 'Gate_05_Markov', regex: /state|transition|probability|stochastic/i, description: 'Markov Chain Gate' },
  { id: 'Gate_06_Bayes', regex: /prior|posterior|evidence|update|belief/i, description: 'Bayesian Inference Gate' },
  { id: 'Gate_07_Nash', regex: /equilibrium|strategy|game|payoff|compete/i, description: 'Nash Equilibrium Gate' },
  { id: 'Gate_08_Godel', regex: /inconsistent|incomplete|axiom|prove|logic/i, description: 'Godel Incompleteness Gate' },
  { id: 'Gate_09_Fermat', regex: /prime|factor|modulo|cryptography|integer/i, description: 'Fermat Number Gate' },
  { id: 'Gate_10_Euler', regex: /graph|path|cycle|vertex|edge/i, description: 'Euler Graph Gate' },
  { id: 'Gate_11_Fourier', regex: /transform|frequency|signal|wave|spectrum/i, description: 'Fourier Transform Gate' },
  { id: 'Gate_12_Heisenberg', regex: /uncertainty|measure|precision|quantum/i, description: 'Heisenberg Uncertainty Gate' },
  { id: 'Gate_13_Maxwell', regex: /thermodynamic|entropy|demon|heat/i, description: 'Maxwell Demon Gate' },
  { id: 'Gate_14_Laplace', regex: /determinism|predict|future|past|mechanics/i, description: 'Laplace Demon Gate' },
  { id: 'Gate_15_Cantor', regex: /infinity|uncountable|diagonal|set/i, description: 'Cantor Infinity Gate' },
  { id: 'Gate_16_Mandelbrot', regex: /fractal|scale|recurse|self-similar/i, description: 'Mandelbrot Fractal Gate' },
  { id: 'Gate_17_Lorentz', regex: /relativity|attractor|chaos|system/i, description: 'Lorentz Attractor Gate' },
  { id: 'Gate_18_Riemann', regex: /zeta|prime|hypothesis|manifold/i, description: 'Riemann Hypothesis Gate' },
  { id: 'Gate_19_Dirichlet', regex: /pigeonhole|distribution|boundary|condition/i, description: 'Dirichlet Principle Gate' },
  { id: 'Gate_20_Euclid', regex: /geometry|space|distance|metric/i, description: 'Euclidean Space Gate' },
  { id: 'Gate_21_Poincare', regex: /topology|sphere|homology|recurrence/i, description: 'Poincare Recurrence Gate' },
  { id: 'Gate_22_Hilbert', regex: /space|dimension|infinite|basis/i, description: 'Hilbert Space Gate' },
  { id: 'Gate_23_Church', regex: /lambda|calculus|function|apply/i, description: 'Church-Turing Gate' }
];

function predictFailedGates(taskDescription) {
  if (!taskDescription || typeof taskDescription !== 'string') {
    return [];
  }

  const triggeredGates = [];
  for (let i = 0; i < GATES.length; i++) {
    const gate = GATES[i];
    if (gate.regex.test(taskDescription)) {
      triggeredGates.push(gate);
    }
  }

  return triggeredGates;
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, text } = input;
  if (action === 'predict') {
    return { ok: true, gates: predictFailedGates(text) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  GATES,
  predictFailedGates,
  safeEval
};
