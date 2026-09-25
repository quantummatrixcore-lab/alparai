'use strict';

/**
 * Martingale Budget Lock
 * Implements Doob/Azuma martingale stopped process bounds to evaluate cumulative
 * defect growth and pre-lock execution if error budget risk exceeds safe thresholds.
 */

function evaluateMartingaleBudget(errorIncrements, budgetLimit) {
  const limit = typeof budgetLimit === 'number' ? budgetLimit : 10.0;
  if (!Array.isArray(errorIncrements) || errorIncrements.length === 0) {
    return {
      cumulativeEnergy: 0.0,
      budgetLimit: limit,
      budgetExceeded: false,
      azumaBound: 0.0,
      safeToProceed: true
    };
  }

  let cumulativeEnergy = 0.0;
  let varianceSum = 0.0;

  for (let i = 0; i < errorIncrements.length; i++) {
    const inc = typeof errorIncrements[i] === 'number' ? errorIncrements[i] : 0.0;
    cumulativeEnergy += inc;
    varianceSum += inc * inc;
  }

  const budgetExceeded = cumulativeEnergy >= limit;
  // Azuma-Hoeffding tail bound: P(M_n >= t) <= exp(-t^2 / (2 * sum(c_i^2)))
  let azumaBound = 1.0;
  if (varianceSum > 1e-12 && limit > 0) {
    azumaBound = Math.exp(-(limit * limit) / (2 * varianceSum));
  }

  const safeToProceed = !budgetExceeded && azumaBound < 0.05;

  return {
    cumulativeEnergy,
    budgetLimit: limit,
    budgetExceeded,
    azumaBound,
    safeToProceed
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, errors, budget } = input;
  if (action === 'evaluate') {
    return { ok: true, result: evaluateMartingaleBudget(errors, budget) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  evaluateMartingaleBudget,
  safeEval
};
