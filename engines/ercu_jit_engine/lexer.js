/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚛️ ALPARAI ERCU-JIT ENGINE: SÖZCÜK ANALİZCİSİ (LEXER)
 * ═══════════════════════════════════════════════════════════════════════════
 */

class Lexer {
    constructor(source) {
        this.source = source;
        this.pos = 0;
        this.line = 1;
        this.tokens = [];
    }

    tokenize() {
        while (this.pos < this.source.length) {
            const char = this.source[this.pos];

            if (char === '\n') {
                this.line++;
                this.pos++;
                continue;
            }
            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }

            if (char === '/' && this.source[this.pos + 1] === '/') {
                while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
                    this.pos++;
                }
                continue;
            }

            if (char === '-' && this.source[this.pos + 1] === '>') {
                this.tokens.push({ type: 'ARROW', value: '->', line: this.line });
                this.pos += 2;
                continue;
            }

            if ('{};(),=:[]+*'.includes(char)) {
                const typeMap = {
                    '{': 'LBRACE', '}': 'RBRACE',
                    '(': 'LPAREN', ')': 'RPAREN',
                    ';': 'SEMICOLON', ',': 'COMMA',
                    '=': 'EQUALS', ':': 'COLON',
                    '[': 'LBRACKET', ']': 'RBRACKET',
                    '+': 'PLUS', '*': 'STAR'
                };
                this.tokens.push({ type: typeMap[char], value: char, line: this.line });
                this.pos++;
                continue;
            }

            if (char === '"' || char === "'") {
                const quote = char;
                let str = '';
                this.pos++;
                while (this.pos < this.source.length && this.source[this.pos] !== quote) {
                    str += this.source[this.pos];
                    this.pos++;
                }
                this.pos++;
                this.tokens.push({ type: 'STRING', value: str, line: this.line });
                continue;
            }

            if (/[0-9]/.test(char)) {
                let num = '';
                while (this.pos < this.source.length && /[0-9.]/.test(this.source[this.pos])) {
                    num += this.source[this.pos];
                    this.pos++;
                }
                this.tokens.push({ type: 'NUMBER', value: parseFloat(num), line: this.line });
                continue;
            }

            if (/[a-zA-Z_]/.test(char)) {
                let ident = '';
                while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
                    ident += this.source[this.pos];
                    this.pos++;
                }

                const keywords = ['task', 'node', 'python', 'merge', 'prob', 'measure', 'let', 'log'];
                if (keywords.includes(ident)) {
                    this.tokens.push({ type: ident.toUpperCase(), value: ident, line: this.line });
                } else {
                    this.tokens.push({ type: 'IDENTIFIER', value: ident, line: this.line });
                }
                continue;
            }

            throw new Error(`[Lexer Hatası] Satır ${this.line}: Tanınmayan karakter '${char}'`);
        }

        this.tokens.push({ type: 'EOF', value: null, line: this.line });
        return this.tokens;
    }
}

module.exports = Lexer;
