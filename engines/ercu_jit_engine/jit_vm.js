/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 ALPARAI ERCU-JIT ENGINE: OTONOM SANAL MAKİNE (VM)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Opcodes = require('./opcodes');
const JITCompiler = require('./jit_compiler');

class AlparaiVM {
    constructor() {
        this.hotCounters = {};
        this.jitCache = {};
        this.HOT_THRESHOLD = 50;
    }

    executeTask(task, silent = true) {
        const taskName = task.name;
        this.hotCounters[taskName] = (this.hotCounters[taskName] || 0) + 1;

        if (this.jitCache[taskName]) {
            return this.runBytecode(this.jitCache[taskName]);
        }

        if (this.hotCounters[taskName] >= this.HOT_THRESHOLD) {
            const compiledBytecode = JITCompiler.compile(task);
            this.jitCache[taskName] = compiledBytecode;
            return this.runBytecode(compiledBytecode);
        }

        return this.runAST(task);
    }

    runAST(task) {
        const states = task.declarations[0]?.states || [];
        const rand = Math.random();
        let cumulative = 0;
        let result = states[0]?.value;
        for (const s of states) {
            cumulative += s.weight;
            if (rand <= cumulative) {
                result = s.value;
                break;
            }
        }
        return result;
    }

    runBytecode(compiled) {
        const code = compiled.code;
        const constants = compiled.constants;
        let ip = 0;
        let lastResult = null;

        while (ip < code.length) {
            const opcode = code[ip++];
            switch (opcode) {
                case Opcodes.OP_PROB_INIT:
                    ip++;
                    break;
                case Opcodes.OP_NODE_EXEC:
                case Opcodes.OP_PY_EXEC:
                    break;
                case Opcodes.OP_MEASURE: {
                    const constIdx = code[ip++];
                    const states = constants[constIdx].states;
                    const rand = Math.random();
                    for (let i = 0; i < states.length; i++) {
                        if (rand <= states[i].limit) {
                            lastResult = states[i].value;
                            break;
                        }
                    }
                    break;
                }
                case Opcodes.OP_HALT:
                    return lastResult;
            }
        }
        return lastResult;
    }
}

module.exports = AlparaiVM;
