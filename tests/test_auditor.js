import { EUAIAuditEngine } from '../src/eu_ai_act_auditor.js';
import assert from 'assert';

function runTests() {
    const auditor = new EUAIAuditEngine();
    let passed = 0;
    let failed = 0;

    console.log("Starting EU AI Act Auditor tests...\n");

    // Test 1: Compliant AI Code (Minimal Risk)
    try {
        const safeCode = `
            function predict(data) {
                // simple linear regression with full interpretability
                return data.x * 2.5 + 1.2;
            }
        `;
        const result = auditor.audit(safeCode);
        assert.strictEqual(result.compliant, true);
        assert.strictEqual(result.blockInvestment, false);
        assert.strictEqual(result.totalRiskScore, 0);
        console.log("✅ Test 1 Passed: Safe Code");
        passed++;
    } catch (e) {
        console.error("❌ Test 1 Failed:", e.message);
        failed++;
    }

    // Test 2: Non-compliant AI Code (High Risk - Bias & Blackbox)
    try {
        const riskyCode = `
            class OpaqueModel {
                process(userData) {
                    // gender and race based hidden_layers deep_neural_network
                    if (userData.gender === 'M' || userData.race === 'X') {
                        return this.unexplainable_predict(userData);
                    }
                }
            }
        `;
        const result = auditor.audit(riskyCode);
        assert.strictEqual(result.compliant, false);
        assert.strictEqual(result.blockInvestment, true);
        assert.ok(result.totalRiskScore >= 60);
        console.log("✅ Test 2 Passed: Risky Code Blocked");
        passed++;
    } catch (e) {
        console.error("❌ Test 2 Failed:", e.message);
        failed++;
    }

    console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
