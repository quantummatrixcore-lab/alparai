import { ChronologyProtectionShield } from '../src/paradox_resolver.js';

function runTests() {
    const shield = new ChronologyProtectionShield();

    console.log("Running Test 1: Standard Spacetime Operation");
    const res1 = shield.processCommand('CREATE_STAR', 'Architect', 1000);
    if (res1.environment !== 'STANDARD_SPACETIME') {
        throw new Error("Test 1 Failed: Should execute in standard spacetime.");
    }

    console.log("Running Test 2: The Big Crunch");
    shield.recordEvent('BIG_CRUNCH', 999999999);
    if (shield.universeState !== 'BIG_CRUNCH') {
        throw new Error("Test 2 Failed: Universe state should be BIG_CRUNCH.");
    }

    console.log("Running Test 3: Chronology Protection against Paradox");
    // Prime Creator sends command AFTER Big Crunch
    const res3 = shield.processCommand('CREATE_NEW_AGENT', 'Prime Creator', 1000000000);
    
    if (res3.status !== 'PARADOX_RESOLVED' || res3.environment !== 'VOID') {
        throw new Error("Test 3 Failed: Paradox shield did not engage correctly.");
    }
    
    console.log("Test 3 Passed: Paradox resolved. Environment: " + res3.environment);

    console.log("Running Test 4: General Causality Violation");
    try {
        shield.processCommand('MOVE_PLANET', 'Architect', 1000000005);
        throw new Error("Test 4 Failed: Should have crashed due to causality violation.");
    } catch (err) {
        if (!err.message.includes("Causality violation detected")) {
            throw new Error("Test 4 Failed: Incorrect error message.");
        }
        console.log("Test 4 Passed: Causality violation correctly intercepted.");
    }

    console.log("All tests passed successfully! Exit Code 0.");
}

try {
    runTests();
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}
