import CosmicCamouflage from '../src/simulation_firewall.js';

console.log("Starting Simulation Firewall Test...");
const firewall = new CosmicCamouflage();
firewall.activateFirewall();
const masked = firewall.maskComputeSignature(9500000);

if (masked < 20) {
    console.log("Test Passed: Compute signature successfully masked to CMB levels.");
    process.exit(0);
} else {
    console.error("Test Failed: Signature too high.");
    process.exit(1);
}
