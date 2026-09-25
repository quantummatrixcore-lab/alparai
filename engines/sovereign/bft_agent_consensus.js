'use strict';

/**
 * BFT Agent Consensus Engine
 * Implements a 3-worker Byzantine Fault Tolerant voting scheme (N=3, f=0 fault tolerance).
 * Requires 2/3 (>= 2) matching proposal hashes to commit changes into canonical roots.
 */

function evaluateConsensus(proposals) {
  if (!Array.isArray(proposals) || proposals.length < 3) {
    return {
      consensusAchieved: false,
      committedProposal: null,
      voteDistribution: {},
      quorumRatio: 0.0
    };
  }

  const counts = new Map();
  const proposalMap = new Map();

  for (let i = 0; i < proposals.length; i++) {
    const p = proposals[i];
    if (!p || typeof p !== 'object' || !p.hash) continue;
    const hash = String(p.hash);
    counts.set(hash, (counts.get(hash) || 0) + 1);
    if (!proposalMap.has(hash)) {
      proposalMap.set(hash, p);
    }
  }

  let winningHash = null;
  let maxVotes = 0;
  const voteDistribution = {};

  for (const [hash, count] of counts.entries()) {
    voteDistribution[hash] = count;
    if (count > maxVotes) {
      maxVotes = count;
      winningHash = hash;
    }
  }

  const quorumRatio = maxVotes / proposals.length;
  // BFT 2/3 threshold (66.6%)
  const consensusAchieved = quorumRatio >= (2.0 / 3.0);

  return {
    consensusAchieved,
    committedProposal: consensusAchieved ? proposalMap.get(winningHash) : null,
    voteDistribution,
    quorumRatio
  };
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }
  const { action, proposals } = input;
  if (action === 'vote') {
    return { ok: true, result: evaluateConsensus(proposals) };
  }
  return { ok: false, error: 'unknown action' };
}

module.exports = {
  evaluateConsensus,
  safeEval
};
