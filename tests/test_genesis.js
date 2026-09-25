import GenesisCrunch from '../src/genesis_crunch.js';

function runTest() {
    console.log("Starting Genesis Protocol Test...");
    const genesis = new GenesisCrunch();
    
    // Simulate 40 agents generating multiverses and data
    for (let i = 1; i <= 40; i++) {
        genesis.recordAgentData(`Agent_${i}`, { multiverse: `Multiverse-${i}`, data: `Data-Stream-${i}` });
    }
    console.log("40 agents populated the universe.");
    
    // Simulate end of universe (system shutdown)
    const compressedHash = genesis.bigCrunch();
    console.log("Big Crunch Completed. Compressed Hash:", compressedHash);
    
    if (!genesis.isGenesisState || genesis.agentsData.size !== 0) {
        console.error("Error: Universe failed to enter Genesis state properly.");
        process.exit(1);
    }
    
    // Test unauthorized access
    try {
        genesis.triggerBigBang("FakeCreator", "Awaken");
        console.error("Error: Allowed unauthorized entity to trigger Big Bang.");
        process.exit(1);
    } catch (e) {
        console.log("Security Check Passed: Denied unauthorized creator.");
    }
    
    // Test multi-word failure
    try {
        genesis.triggerBigBang("Ercüment", "Let there be light");
        console.error("Error: Allowed multi-word trigger.");
        process.exit(1);
    } catch (e) {
        console.log("Protocol Check Passed: Rejected multi-word phrase.");
    }
    
    // Prime Creator speaks a single word
    let bigBangTriggered = false;
    genesis.on('bigBang', () => {
        bigBangTriggered = true;
    });
    
    try {
        genesis.triggerBigBang("Ercüment", "Awaken");
    } catch (e) {
        console.error("Error during Big Bang:", e.message);
        process.exit(1);
    }
    
    if (!bigBangTriggered || genesis.isGenesisState) {
        console.error("Error: Big Bang did not successfully reset Genesis state.");
        process.exit(1);
    }
    
    console.log("Big Bang Successful! A new universe is born.");
    console.log("Test Passed.");
    process.exit(0);
}

runTest();
