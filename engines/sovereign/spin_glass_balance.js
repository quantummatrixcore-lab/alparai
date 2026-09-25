'use strict';

/**
 * Spin Glass Balancer
 * Simulates an Ising model Hamiltonian to partition concurrent work orders
 * and resolve file contention deterministically using Park-Miller PRNG.
 */

function createPRNG(seed) {
  let s = (seed || 1234567) % 2147483647;
  if (s <= 0) s += 2147483646;
  return function next() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

class SpinGlassBalancer {
  constructor(workOrders, seed) {
    this.workOrders = Array.isArray(workOrders) ? workOrders : [];
    this.N = this.workOrders.length;
    this.rng = createPRNG(seed);
    this.spins = new Array(this.N);
    for (let i = 0; i < this.N; i++) {
      this.spins[i] = this.rng() > 0.5 ? 1 : -1;
    }
    this.J = this.buildCouplingMatrix();
  }

  buildCouplingMatrix() {
    const J = Array.from({ length: this.N }, () => new Array(this.N).fill(0));
    for (let i = 0; i < this.N; i++) {
      for (let j = i + 1; j < this.N; j++) {
        const orderA = this.workOrders[i];
        const orderB = this.workOrders[j];
        const filesA = (orderA && Array.isArray(orderA.files)) ? orderA.files : [];
        const filesB = (orderB && Array.isArray(orderB.files)) ? orderB.files : [];

        let hasConflict = false;
        for (let k = 0; k < filesA.length; k++) {
          if (filesB.indexOf(filesA[k]) !== -1) {
            hasConflict = true;
            break;
          }
        }

        if (hasConflict) {
          J[i][j] = -1;
          J[j][i] = -1;
        }
      }
    }
    return J;
  }

  calculateEnergy() {
    let energy = 0;
    for (let i = 0; i < this.N; i++) {
      for (let j = i + 1; j < this.N; j++) {
        energy += -this.J[i][j] * this.spins[i] * this.spins[j];
      }
    }
    return energy;
  }

  optimize(initialTemp, coolingRate, minTemp, iterationsPerTemp) {
    let temp = typeof initialTemp === 'number' ? initialTemp : 5.0;
    const cooling = typeof coolingRate === 'number' ? coolingRate : 0.95;
    const minT = typeof minTemp === 'number' ? minTemp : 0.05;
    const iters = typeof iterationsPerTemp === 'number' ? iterationsPerTemp : 50;

    while (temp > minT) {
      for (let k = 0; k < iters; k++) {
        if (this.N === 0) break;
        const i = Math.floor(this.rng() * this.N);
        let dE = 0;
        for (let j = 0; j < this.N; j++) {
          if (i !== j) {
            dE += 2 * this.J[i][j] * this.spins[i] * this.spins[j];
          }
        }

        if (dE < 0 || this.rng() < Math.exp(-dE / temp)) {
          this.spins[i] *= -1;
        }
      }
      temp *= cooling;
    }
  }

  getGroups() {
    const group1 = [];
    const group2 = [];
    for (let i = 0; i < this.N; i++) {
      if (this.spins[i] === 1) {
        group1.push(this.workOrders[i]);
      } else {
        group2.push(this.workOrders[i]);
      }
    }
    return { group1, group2 };
  }
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }

  const { action, workOrders, seed } = input;
  if (action === 'balance') {
    const balancer = new SpinGlassBalancer(workOrders, seed);
    balancer.optimize();
    const groups = balancer.getGroups();
    const energy = balancer.calculateEnergy();
    return { ok: true, energy, groups };
  }

  return { ok: false, error: 'unknown action' };
}

module.exports = {
  createPRNG,
  SpinGlassBalancer,
  safeEval
};
