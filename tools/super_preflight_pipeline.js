'use strict';

/**
 * Super Preflight Pipeline Engine
 * Integrates Wave-1 and Wave-2 Super Innovations into a unified pre-dispatch validation pipeline:
 * - ghost_gate
 * - entropic_firewall
 * - fractal_hausdorff
 * - spin_glass_balance
 * - spectral_resonance_lock
 * - topological_ast_homology
 * - causal_graph_interferometry
 * - martingale_budget_lock
 */

const { predictFailedGates } = require('../innovations/ghost_gate');
const { evaluateTask } = require('../innovations/entropic_firewall');
const { computeFractalDimension } = require('../innovations/fractal_hausdorff');
const { SpinGlassBalancer } = require('../innovations/spin_glass_balance');
const { evaluateLyapunovSpectrum } = require('../innovations/spectral_resonance_lock');
const { analyzeAstHomology } = require('../innovations/topological_ast_homology');
const { calculateWaveInterference } = require('../innovations/causal_graph_interferometry');
const { evaluateMartingaleBudget } = require('../innovations/martingale_budget_lock');

function evaluatePreflight(taskContext) {
  const ctx = taskContext || {};
  const taskDesc = ctx.description || '';
  const lyapunovPotential = ctx.lyapunovPotential || 1.0;
  const entropyThreshold = ctx.entropyThreshold || 25.0;

  // 1. Ghost Gate Pre-mortem
  const predictedGates = predictFailedGates(taskDesc);

  // 2. Entropic Firewall
  const firewallAllowed = evaluateTask(taskDesc, lyapunovPotential, entropyThreshold);

  // 3. Structural AST checks (if AST provided)
  let astComplexity = null;
  let astHomology = null;
  if (ctx.ast) {
    astComplexity = computeFractalDimension(ctx.ast);
    astHomology = analyzeAstHomology(ctx.ast);
  }

  // 4. Wave Interference (if peer task parameters provided)
  let waveInterference = null;
  if (ctx.peerTask) {
    waveInterference = calculateWaveInterference(
      ctx.amplitude || 1.0,
      ctx.phase || 0.0,
      ctx.peerTask.amplitude || 1.0,
      ctx.peerTask.phase || 0.0
    );
  }

  // 5. Martingale Error Budget
  const martingale = evaluateMartingaleBudget(ctx.errorIncrements || [], ctx.budgetLimit || 10.0);

  // 6. Spectral Trajectory Lock
  const spectral = evaluateLyapunovSpectrum(ctx.trajectory || []);

  const passesPreflight = firewallAllowed &&
    !martingale.budgetExceeded &&
    !spectral.locked &&
    (!astComplexity || !astComplexity.isOverlyComplex) &&
    (!waveInterference || !waveInterference.isDestructive);

  return {
    passesPreflight,
    checks: {
      predictedGatesCount: predictedGates.length,
      firewallAllowed,
      martingaleBudgetExceeded: martingale.budgetExceeded,
      spectralLocked: spectral.locked,
      astOverlyComplex: astComplexity ? astComplexity.isOverlyComplex : false,
      isDestructiveInterference: waveInterference ? waveInterference.isDestructive : false
    }
  };
}

function partitionConcurrentOrders(orders, seed) {
  const balancer = new SpinGlassBalancer(orders, seed || 42);
  balancer.optimize();
  return {
    energy: balancer.calculateEnergy(),
    partitions: balancer.getGroups()
  };
}

module.exports = {
  evaluatePreflight,
  partitionConcurrentOrders
};
