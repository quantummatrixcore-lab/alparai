import AutonomousLobbyist from '../src/autonomous_lobbyist.js';

function runTests() {
    console.log("Running tests for Autonomous Lobbyist...");
    const lobbyist = new AutonomousLobbyist();
    
    const campaign = lobbyist.generateCampaign(
        "AI Act 2026",
        "Artificial Intelligence",
        "Generative AI",
        "$50 Billion",
        "100,000",
        "Senator Smith"
    );

    let passed = true;

    if (!campaign.whitepaper.includes("AI Act 2026")) {
        console.error("Test Failed: Whitepaper missing regulation name.");
        passed = false;
    }

    if (!campaign.email.includes("Senator Smith")) {
        console.error("Test Failed: Email missing politician name.");
        passed = false;
    }

    if (!campaign.whitepaper.includes("Generative AI")) {
        console.error("Test Failed: Whitepaper missing technology focus.");
        passed = false;
    }

    if (passed) {
        console.log("All tests passed!");
        process.exit(0);
    } else {
        console.error("Some tests failed.");
        process.exit(1);
    }
}

runTests();
