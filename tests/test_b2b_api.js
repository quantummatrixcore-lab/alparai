import assert from 'assert';
import { B2BAPIManager } from '../src/b2b_api.js';

function runTests() {
    console.log("Running B2B API Manager tests...");
    
    const apiManager = new B2BAPIManager({
        costPerCall: 0.05,
        costPerToken: 0.001,
        rateLimit: 3,
        timeWindowMs: 1000 // 1 second for easier testing
    });

    const clientId = 'company_A';

    // Test 1: Successful request
    let res = apiManager.processRequest(clientId, 100);
    assert.strictEqual(res.success, true, "First request should succeed");
    assert.strictEqual(res.usage.callsInWindow, 1);
    // Cost = 0.05 + 100 * 0.001 = 0.15
    assert.strictEqual(res.usage.currentBill, 0.15);
    console.log("Test 1 Passed: First request");

    // Test 2: Second request
    res = apiManager.processRequest(clientId, 50);
    assert.strictEqual(res.success, true, "Second request should succeed");
    assert.strictEqual(res.usage.callsInWindow, 2);
    // Previous bill = 0.15, New cost = 0.05 + 50 * 0.001 = 0.10. Total = 0.25
    assert.strictEqual(res.usage.currentBill, 0.25);
    console.log("Test 2 Passed: Second request");

    // Test 3: Third request
    res = apiManager.processRequest(clientId, 200);
    assert.strictEqual(res.success, true, "Third request should succeed");
    assert.strictEqual(res.usage.callsInWindow, 3);
    // Previous bill = 0.25, New cost = 0.05 + 200 * 0.001 = 0.25. Total = 0.50
    assert.strictEqual(res.usage.currentBill, 0.50);
    console.log("Test 3 Passed: Third request (hit rate limit bound)");

    // Test 4: Rate limit exceeded
    res = apiManager.processRequest(clientId, 10);
    assert.strictEqual(res.success, false, "Fourth request should fail due to rate limit");
    assert.strictEqual(res.error, 'Rate limit exceeded. Please try again later.');
    console.log("Test 4 Passed: Rate limit handled correctly");

    // Test 5: Invoice generation
    const invoice = apiManager.generateInvoice(clientId);
    assert.strictEqual(invoice.totalTokens, 350); // 100 + 50 + 200
    assert.strictEqual(invoice.totalBill, 0.50);
    console.log("Test 5 Passed: Invoice generated correctly");

    // Test 6: Rate limit window reset
    console.log("Waiting for rate limit window to reset (1 second)...");
    setTimeout(() => {
        try {
            res = apiManager.processRequest(clientId, 10);
            assert.strictEqual(res.success, true, "Request should succeed after window reset");
            assert.strictEqual(res.usage.callsInWindow, 1, "Calls in window should reset to 1");
            console.log("Test 6 Passed: Rate limit reset correctly");
            
            console.log("All tests passed successfully.");
            process.exit(0);
        } catch (e) {
            console.error("Test 6 Failed:", e.message);
            process.exit(1);
        }
    }, 1100);
}

runTests();
