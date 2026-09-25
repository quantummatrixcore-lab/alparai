'use strict';

/**
 * Time Crystal Memory
 * Implements a discrete time-translation symmetry breaking event ledger
 * to detect periodic recurrence traps and prevent defect regression loops.
 */

class TimeCrystalMemory {
  constructor(period) {
    this.period = typeof period === 'number' && period > 0 ? period : 4;
    this.events = [];
    this.step = 0;
  }

  recordEvent(eventType, payload) {
    const phaseTag = this.step % this.period;
    const entry = {
      step: this.step,
      phaseTag,
      type: String(eventType || 'GENERIC'),
      payloadHash: JSON.stringify(payload || {}).length
    };
    this.events.push(entry);
    this.step++;
    return entry;
  }

  detectRecurrenceCycle() {
    if (this.events.length < this.period * 2) {
      return { hasCycle: false, cyclePeriod: 0 };
    }

    const n = this.events.length;
    const lastType = this.events[n - 1].type;
    const matchIndex = this.events.slice(0, n - 1).findLastIndex(e => e.type === lastType);

    if (matchIndex !== -1) {
      const distance = (n - 1) - matchIndex;
      if (distance > 0 && distance % this.period === 0) {
        return { hasCycle: true, cyclePeriod: distance };
      }
    }

    return { hasCycle: false, cyclePeriod: 0 };
  }
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }
  const { action, events, period } = input;
  if (action === 'simulate') {
    const mem = new TimeCrystalMemory(period);
    const recorded = [];
    const evts = Array.isArray(events) ? events : [];
    for (let i = 0; i < evts.length; i++) {
      recorded.push(mem.recordEvent(evts[i].type, evts[i].payload));
    }
    const cycleInfo = mem.detectRecurrenceCycle();
    return { ok: true, recorded, cycleInfo };
  }
  return { ok: false, error: 'unknown action' };
}

module.exports = {
  TimeCrystalMemory,
  safeEval
};
