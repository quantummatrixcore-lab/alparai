'use strict';

/**
 * Topological AST Homology Analyzer
 * Computes graph topological invariants (Betti numbers beta_0, beta_1) on AST structures
 * using the Euler-Poincare characteristic formula: Chi = V - E = beta_0 - beta_1.
 */

function analyzeAstHomology(ast) {
  if (!ast || typeof ast !== 'object') {
    return {
      nodes: 0,
      edges: 0,
      betti0: 0,
      betti1: 0,
      eulerChar: 0,
      isAcyclic: true
    };
  }

  let nodes = 0;
  let edges = 0;
  const visited = new Set();
  const parentMap = new Map();
  let cycles = 0;

  function traverse(node, parentId) {
    if (!node || typeof node !== 'object') return;

    nodes++;
    const currentId = nodes;

    if (parentId !== null) {
      edges++;
      parentMap.set(currentId, parentId);
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        traverse(node[i], currentId);
      }
    } else {
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i++) {
        const child = node[keys[i]];
        if (child && typeof child === 'object') {
          traverse(child, currentId);
        }
      }
    }
  }

  traverse(ast, null);

  // In tree traversal without back-edges, beta_0 = 1 (if nodes > 0), beta_1 = edges - nodes + beta_0
  const betti0 = nodes > 0 ? 1 : 0;
  // If edges > nodes - 1, cycles exist
  const betti1 = Math.max(0, edges - nodes + betti0);
  const eulerChar = nodes - edges;

  return {
    nodes,
    edges,
    betti0,
    betti1,
    eulerChar,
    isAcyclic: betti1 === 0
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, ast } = input;
  if (action === 'homology') {
    return { ok: true, result: analyzeAstHomology(ast) };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  analyzeAstHomology,
  safeEval
};
