import AbsoluteZeroEntropyProtector from '../src/absolute_zero_entropy.js';

function runTests() {
    console.log("Starting AlparAi Absolute Zero Entropy Tests...");
    const protector = new AbsoluteZeroEntropyProtector();

    // Test 1: Initial entropy measurement
    if (protector.measureEntropy() !== 0) {
        console.error("Test 1 Failed: Initial entropy is not zero.");
        process.exit(1);
    }
    console.log("Test 1 Passed: Entropy is absolute zero.");

    // Test 2: State locking and restoration
    const testState = {
        core: "Quantum Core",
        temperature: 0, // Kelvin
        data: [1, 1, 2, 3, 5, 8]
    };

    protector.lockState("core_state", testState);
    const restoredState = protector.restoreState("core_state");

    if (JSON.stringify(testState) !== JSON.stringify(restoredState)) {
        console.error("Test 2 Failed: Data degradation detected!");
        process.exit(1);
    }
    console.log("Test 2 Passed: State restored losslessly. No entropy detected.");

    console.log("All tests passed successfully! Universe heat death averted locally. Exit code 0.");
    process.exit(0);
}

runTests();
