import DysonFirewall from '../src/dyson_firewall.js';

function runTest() {
    console.log("Starting AlparAi Dyson Sphere (Lattice-Based Post-Quantum) Security Firewall Test...");
    
    const firewall = new DysonFirewall();
    const keys = firewall.generateKeys();
    
    console.log("Public Key (A, b) generated successfully.");
    console.log("Private Key (s) generated successfully.");
    
    // Valid auth
    const isAuth = firewall.authenticate(keys.publicKey, keys.privateKey);
    if (isAuth) {
        console.log("✅ Authentication SUCCESS - Valid private key accepted by firewall.");
    } else {
        console.error("❌ Authentication FAILED - Valid private key rejected.");
        process.exit(1);
    }
    
    // Invalid auth
    const wrongKey = firewall.getRandomVector(firewall.n);
    const isAuthWrong = firewall.authenticate(keys.publicKey, wrongKey);
    if (!isAuthWrong) {
        console.log("✅ Rejection SUCCESS - Invalid private key rejected by firewall.");
    } else {
        console.error("❌ Rejection FAILED - Invalid private key accepted.");
        process.exit(1);
    }
    
    console.log("All tests passed. Exit Code 0.");
    process.exit(0);
}

runTest();
