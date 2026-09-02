/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚛️ ALPARAI ERCU-JIT ENGINE: SÖZDİZİM AYRIŞTIRICISI (PARSER)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() {
        return this.tokens[this.pos];
    }

    consume(expectedType) {
        const token = this.peek();
        if (expectedType && token.type !== expectedType) {
            throw new Error(`[Parser Hatası] Satır ${token.line}: '${expectedType}' bekleniyordu, fakat '${token.type}' bulundu.`);
        }
        this.pos++;
        return token;
    }

    parse() {
        const ast = { type: 'Program', tasks: [] };
        while (this.peek().type !== 'EOF') {
            if (this.peek().type === 'TASK') {
                ast.tasks.push(this.parseTask());
            } else {
                throw new Error(`[Parser Hatası] Satır ${this.peek().line}: 'task' tanımı bekleniyordu.`);
            }
        }
        return ast;
    }

    parseTask() {
        this.consume('TASK');
        const taskName = this.consume('IDENTIFIER').value;
        this.consume('LBRACE');

        const taskNode = {
            type: 'TaskDeclaration',
            name: taskName,
            declarations: [],
            nodeBlock: null,
            pythonBlock: null,
            mergeBlock: null
        };

        while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
            const token = this.peek();
            if (token.type === 'PROB') {
                taskNode.declarations.push(this.parseProb());
            } else if (token.type === 'NODE') {
                taskNode.nodeBlock = this.parseCodeBlock('NODE');
            } else if (token.type === 'PYTHON') {
                taskNode.pythonBlock = this.parseCodeBlock('PYTHON');
            } else if (token.type === 'MERGE') {
                taskNode.mergeBlock = this.parseMergeBlock();
            } else {
                throw new Error(`[Parser Hatası] Satır ${token.line}: Beklenmeyen ifade '${token.value}'`);
            }
        }

        this.consume('RBRACE');
        return taskNode;
    }

    parseProb() {
        this.consume('PROB');
        const varName = this.consume('IDENTIFIER').value;
        this.consume('EQUALS');
        this.consume('LBRACKET');

        const states = [];
        while (this.peek().type !== 'RBRACKET') {
            const weight = this.consume('NUMBER').value;
            this.consume('COLON');
            const stateValue = this.consume('STRING').value;
            states.push({ weight, value: stateValue });

            if (this.peek().type === 'COMMA') {
                this.consume('COMMA');
            }
        }

        this.consume('RBRACKET');
        this.consume('SEMICOLON');

        return { type: 'ProbabilisticDeclaration', name: varName, states };
    }

    parseCodeBlock(blockType) {
        this.consume(blockType);
        this.consume('LBRACE');

        const statements = [];
        while (this.peek().type !== 'RBRACE') {
            if (this.peek().type === 'LOG') {
                this.consume('LOG');
                this.consume('LPAREN');
                const msg = this.consume('STRING').value;
                this.consume('RPAREN');
                this.consume('SEMICOLON');
                statements.push({ type: 'LogStatement', message: msg });
            } else if (this.peek().type === 'LET') {
                this.consume('LET');
                const id = this.consume('IDENTIFIER').value;
                this.consume('EQUALS');
                const valToken = this.peek();
                let val;
                if (valToken.type === 'STRING' || valToken.type === 'NUMBER') {
                    val = this.consume().value;
                }
                this.consume('SEMICOLON');
                statements.push({ type: 'LetStatement', identifier: id, value: val });
            } else {
                this.pos++;
            }
        }

        this.consume('RBRACE');
        return { type: `${blockType}_Block`, statements };
    }

    parseMergeBlock() {
        this.consume('MERGE');
        this.consume('LBRACE');

        const statements = [];
        while (this.peek().type !== 'RBRACE') {
            if (this.peek().type === 'MEASURE') {
                this.consume('MEASURE');
                const targetProb = this.consume('IDENTIFIER').value;
                this.consume('ARROW');
                const outputVar = this.consume('IDENTIFIER').value;
                this.consume('SEMICOLON');
                statements.push({ type: 'MeasureStatement', source: targetProb, destination: outputVar });
            } else if (this.peek().type === 'LOG') {
                this.consume('LOG');
                this.consume('LPAREN');
                const msg = this.consume('STRING').value;
                this.consume('RPAREN');
                this.consume('SEMICOLON');
                statements.push({ type: 'LogStatement', message: msg });
            } else {
                this.pos++;
            }
        }

        this.consume('RBRACE');
        return { type: 'MergeBlock', statements };
    }
}

module.exports = Parser;
