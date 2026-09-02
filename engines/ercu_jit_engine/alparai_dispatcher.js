/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🌐 ALPARAI JIT SWARM DISPATCHER (Node.js & Next.js API Köprüsü)
 * ═══════════════════════════════════════════════════════════════════════════
 * Kullanım:
 * const dispatcher = require('./engines/ercu_jit_engine/alparai_dispatcher');
 * const targetAgent = dispatcher.routeRequest({ type: 'UI' });
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const Lexer = require('./lexer');
const Parser = require('./parser');
const AlparaiVM = require('./jit_vm');

class AlparaiDispatcher {
    constructor() {
        const ercuPath = path.join(__dirname, 'swarm_router.ercu');
        const sourceCode = fs.readFileSync(ercuPath, 'utf8');

        const lexer = new Lexer(sourceCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();

        this.task = ast.tasks[0];
        this.vm = new AlparaiVM();

        // JIT Motorunu ısıt (Turbo moda sok)
        for (let i = 0; i < 60; i++) {
            this.vm.executeTask(this.task, true);
        }
    }

    dispatch() {
        return this.vm.executeTask(this.task, true);
    }
}

// Test ve Benchmark Çalıştırması
if (require.main === module) {
    console.log('\n' + '═'.repeat(75));
    console.log('🏛️ [ALPARAI JIT SWARM DISPATCHER AKTİF EDİLDİ]');
    console.log('═'.repeat(75));

    const dispatcher = new AlparaiDispatcher();
    console.log('✔ Motor başlatıldı ve JIT Turbo moduna kilitlendi.');

    // 10 adet canlı yönlendirme örneği
    console.log('\n📡 CANLI İSTEK YÖNLENDİRME TESTİ (10 İstek):');
    for (let i = 1; i <= 10; i++) {
        const agent = dispatcher.dispatch();
        console.log(`   [İstek #${i}]: ${agent}`);
    }

    // 50.000 İsteklik Stres Testi
    console.log('\n🔥 [STRES TESTİ]: 50.000 İstek Alparai Sürü Motorundan Geçiriliyor...');
    const tStart = process.hrtime.bigint();
    for (let i = 0; i < 50000; i++) {
        dispatcher.dispatch();
    }
    const tEnd = process.hrtime.bigint();
    const durationMs = Number(tEnd - tStart) / 1000000;
    const opsPerSec = Math.round(50000 / (durationMs / 1000));

    console.log('═'.repeat(75));
    console.log(`⏱ 50.000 İsteğin Tamamlanma Süresi: ${durationMs.toFixed(2)} ms`);
    console.log(`🚀 ALPARAI SÜRÜ KAPASİTESİ        : ${opsPerSec.toLocaleString()} İSTEK / SANİYE!`);
    console.log('═'.repeat(75) + '\n');
}

module.exports = AlparaiDispatcher;
