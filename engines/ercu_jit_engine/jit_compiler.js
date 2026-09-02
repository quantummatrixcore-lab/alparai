/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ ALPARAI ERCU-JIT ENGINE: JIT DERLEYİCİ
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Opcodes = require('./opcodes');

class JITCompiler {
    static compile(task) {
        const bytecode = [];
        const constants = [];

        for (const decl of task.declarations) {
            if (decl.type === 'ProbabilisticDeclaration') {
                let cumulative = 0;
                const precalculatedStates = decl.states.map(s => {
                    cumulative += s.weight;
                    return { limit: cumulative, value: s.value };
                });
                const constIndex = constants.length;
                constants.push({ name: decl.name, states: precalculatedStates });
                bytecode.push(Opcodes.OP_PROB_INIT, constIndex);
            }
        }

        if (task.nodeBlock) bytecode.push(Opcodes.OP_NODE_EXEC);
        if (task.pythonBlock) bytecode.push(Opcodes.OP_PY_EXEC);

        if (task.mergeBlock) {
            for (const stmt of task.mergeBlock.statements) {
                if (stmt.type === 'MeasureStatement') {
                    bytecode.push(Opcodes.OP_MEASURE, 0);
                }
            }
        }

        bytecode.push(Opcodes.OP_HALT);

        return {
            name: task.name,
            code: new Uint8Array(bytecode),
            constants
        };
    }
}

module.exports = JITCompiler;
