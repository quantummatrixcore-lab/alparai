import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ZKP = require('D:/001-AGI/engines/v114_zkp_verifier_engine').ZKPVerifier;
const node = new ZKP();
const ts = Date.now();
const proof = node.generateProof(process.env.AGI_SECRET || 'default', {nodeId: 'AlparAi', ts: ts});
console.log(JSON.stringify({nodeId:'AlparAi', verified: node.verifyProof(proof, {nodeId:'AlparAi', ts: ts}), proofHash: proof.commitment}));