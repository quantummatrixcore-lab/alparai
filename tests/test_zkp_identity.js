import assert from 'assert';
import ZKPIdentity from '../src/zkp_identity.js';

function runTests() {
    console.log("Initializing AlparAi ZKP Identity Shield...");
    const zkp = new ZKPIdentity();

    // The user's actual, private data (never shared with VC)
    const myIdentity = {
        name: "Ali Veli",
        tcNo: "12345678901",
        cvUrl: "https://secret-cv.url/aliveli.pdf"
    };

    const myAttributes = {
        university: "ODTÜ",
        awsExperienceYears: 5,
        skills: ["Node.js", "ZKP", "AWS"]
    };

    console.log("1. Generating Commitment...");
    const { commitment, salt } = zkp.generateCommitment(myIdentity, myAttributes);
    console.log(`Commitment generated: ${commitment.substring(0, 20)}...`);

    // The statement we want to prove to the VC
    const statementStr = "Ben ODTÜ mezunuyum ve 5 yıl AWS tecrübem var";
    
    // The evaluator function that the simulated ZK circuit uses
    const statementEvaluator = (attrs) => {
        return attrs.university === "ODTÜ" && attrs.awsExperienceYears >= 5;
    };

    console.log("2. Generating ZK Proof...");
    const proof = zkp.generateProof(
        myIdentity, 
        myAttributes, 
        salt, 
        statementStr, 
        statementEvaluator
    );
    console.log("Proof successfully generated without revealing identity.");

    console.log("3. Verifying Proof (VC Side)...");
    const isProofValid = zkp.verifyProof(commitment, proof);
    assert.strictEqual(isProofValid, true, "Valid proof should be accepted!");
    console.log("Verification Result: SUCCESS! Identity Shield holds.");

    // Test a failure case
    console.log("4. Testing invalid proof generation (should fail)...");
    const fakeEvaluator = (attrs) => attrs.university === "Stanford"; // Fake claim
    let fakeProofFailed = false;
    try {
        zkp.generateProof(myIdentity, myAttributes, salt, "Stanford mezunuyum", fakeEvaluator);
    } catch (err) {
        fakeProofFailed = true;
    }
    assert.strictEqual(fakeProofFailed, true, "Invalid proof generation should throw an error");
    console.log("Invalid proof correctly rejected at generation.");

    console.log("\nAll ZKP Identity tests passed successfully! (Exit Code 0)");
}

try {
    runTests();
    process.exit(0);
} catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
}
