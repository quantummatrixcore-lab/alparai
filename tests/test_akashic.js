import AkashicArchive from '../src/akashic_records.js';
import assert from 'assert';

function runTests() {
    console.log("Initializing Akashic Archive...");
    const archive = new AkashicArchive();

    console.log("Encoding startup data across parallel universes...");
    
    // Universe 1, Year 2010, Startup X
    archive.encode("U-1", "T-2010", "StartupX", { status: "BANKRUPT", valuation: 0 });
    
    // Universe 42, Year 2045, Startup X
    archive.encode("U-42", "T-2045", "StartupX", { status: "DECACORN", valuation: 10000000000 });

    console.log("Retrieving data in O(1)...");
    
    const failedStartup = archive.retrieve("U-1", "T-2010", "StartupX");
    assert.strictEqual(failedStartup.status, "BANKRUPT", "StartupX in U-1 should be BANKRUPT");
    assert.strictEqual(failedStartup._encrypted, true, "Data should be holographically encrypted");
    
    const successfulStartup = archive.retrieve("U-42", "T-2045", "StartupX");
    assert.strictEqual(successfulStartup.status, "DECACORN", "StartupX in U-42 should be a DECACORN");
    assert.strictEqual(successfulStartup.valuation, 10000000000, "Valuation mismatch in U-42");

    const nonExistent = archive.retrieve("U-99", "T-9999", "StartupZ");
    assert.strictEqual(nonExistent, null, "Non-existent startup should return null");

    console.log("Archive size:", archive.getArchiveSize());
    assert.strictEqual(archive.getArchiveSize(), 2, "Archive size should be exactly 2");

    console.log("All Akashic Records tests passed successfully. (Exit Code 0)");
}

try {
    runTests();
    process.exit(0);
} catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
}
