'use strict';

/**
 * Time-Space Complexity Enforcer
 * Estimates Big-O time exponent and spatial depth directly from AST structures,
 * rejecting cubic O(N^3) loops or excessive stack depths.
 */

function estimateComplexity(ast) {
  if (!ast || typeof ast !== 'object') {
    return {
      timeExponent: 0,
      spaceDepth: 0,
      bigOTime: 'O(1)',
      bigOSpace: 'O(1)',
      passesLimits: true
    };
  }

  let maxLoopNesting = 0;
  let maxDepth = 0;

  function traverse(node, currentLoopNesting, depth) {
    if (!node) return;
    if (depth > maxDepth) maxDepth = depth;

    let newLoopNesting = currentLoopNesting;
    const typeStr = String(node.type || node.kind || '');
    if (typeStr.indexOf('For') !== -1 || typeStr.indexOf('While') !== -1 || typeStr.indexOf('Loop') !== -1) {
      newLoopNesting++;
      if (newLoopNesting > maxLoopNesting) {
        maxLoopNesting = newLoopNesting;
      }
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        traverse(node[i], newLoopNesting, depth + 1);
      }
    } else if (typeof node === 'object') {
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i++) {
        const child = node[keys[i]];
        if (child && typeof child === 'object') {
          traverse(child, newLoopNesting, depth + 1);
        }
      }
    }
  }

  traverse(ast, 0, 1);

  const timeExponent = maxLoopNesting;
  const spaceDepth = maxDepth;
  const bigOTime = timeExponent === 0 ? 'O(1)' : (timeExponent === 1 ? 'O(N)' : `O(N^${timeExponent})`);
  const bigOSpace = `O(D_${spaceDepth})`;

  // Reject cubic O(N^3+) loops or depth > 500
  const passesLimits = timeExponent <= 2 && spaceDepth <= 500;

  return {
    timeExponent,
    spaceDepth,
    bigOTime,
    bigOSpace,
    passesLimits
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }
  const { action, ast } = input;
  if (action === 'enforce') {
    return { ok: true, result: estimateComplexity(ast) };
  }
  return { ok: false, error: 'unknown action' };
}

module.exports = {
  estimateComplexity,
  safeEval
};
