import DefconPredictor from '../src/defcon_predictor.js';

function runTests() {
    console.log("Running DefconPredictor tests...");
    
    const predictor = new DefconPredictor();
    
    // Test 1: Peaceful news
    const peaceNews = [
        "Global peace agreement signed today.",
        "Diplomacy wins over war."
    ];
    let defcon = predictor.analyzeNews(peaceNews);
    // score: peace(1), agreement(1), diplomacy(1), war(-1) = 2. defcon = min(5, 5+2) = 5
    if (defcon !== 5) throw new Error("Test 1 Failed: Expected DEFCON 5, got " + defcon);
    console.log("Test 1 Passed: Peace news correctly identified as DEFCON 5.");
    
    // Test 2: Mild threats
    const mildThreatNews = [
        "There is a crisis in the region.",
        "Economic threat looms."
    ];
    defcon = predictor.analyzeNews(mildThreatNews);
    // score: crisis(-1), threat(-1) = -2. defcon = 5 - 2 = 3
    if (defcon !== 3) throw new Error("Test 2 Failed: Expected DEFCON 3, got " + defcon);
    if (predictor.liquiditySecured) throw new Error("Test 2 Failed: Liquidity should not be secured at DEFCON 3.");
    console.log("Test 2 Passed: Mild threats correctly identified as DEFCON 3.");
    
    // Test 3: Severe threats causing DEFCON 2 or lower
    const severeNews = [
        "Nuclear war threat mobilization reported.",
        "Missile crisis escalating."
    ];
    defcon = predictor.analyzeNews(severeNews);
    // score: nuclear(-2), war(-1), threat(-1), mobilization(-1), missile(-1), crisis(-1) = -7. defcon = max(1, 5 - 7) = 1
    if (defcon > 2) throw new Error("Test 3 Failed: Expected DEFCON <= 2, got " + defcon);
    if (!predictor.liquiditySecured) throw new Error("Test 3 Failed: Liquidity was not secured during severe crisis.");
    console.log("Test 3 Passed: Severe threats identified, emergency protocol activated successfully.");
    
    console.log("All tests passed successfully.");
}

try {
    runTests();
    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
