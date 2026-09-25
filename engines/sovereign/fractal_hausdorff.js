'use strict';

/**
 * Fractal Hausdorff Complexity Estimator
 * Measures structural tree branching and estimates Hausdorff dimension.
 */

const GOLDEN_RATIO = 1.61803398875;

function computeFractalDimension(ast) {
  if (!ast || typeof ast !== 'object') {
    return {
      totalNodes: 0,
      maxDepth: 0,
      dimension: 1.0,
      isOverlyComplex: false
    };
  }

  let totalNodes = 0;
  let maxDepth = 0;

  function traverse(node, depth) {
    if (!node) return;
    totalNodes++;
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        traverse(node[i], depth + 1);
      }
    } else if (typeof node === 'object') {
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i++) {
        const child = node[keys[i]];
        if (child && typeof child === 'object') {
          traverse(child, depth + 1);
        }
      }
    }
  }

  traverse(ast, 1);

  let dimension = 1.0;
  if (maxDepth > 1 && totalNodes > 1) {
    dimension = Math.log(totalNodes) / Math.log(maxDepth);
  }

  const isOverlyComplex = dimension > GOLDEN_RATIO;

  return {
    totalNodes,
    maxDepth,
    dimension,
    isOverlyComplex
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, ast } = input;
  if (action === 'measure') {
    const res = computeFractalDimension(ast);
    return { ok: true, result: res };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  GOLDEN_RATIO,
  computeFractalDimension,
  safeEval
};
