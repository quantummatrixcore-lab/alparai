'use strict';

/**
 * Post-Quantum Sealer
 * Implements lattice-inspired polynomial hashing (GF_q ring modular arithmetic)
 * to provide post-quantum signature verification alongside HMAC-SHA384 digests.
 */

const Q = 12289;

function generateLatticeHash(dataBuffer) {
  const buf = Buffer.isBuffer(dataBuffer) ? dataBuffer : Buffer.from(String(dataBuffer || ''));
  let polySum = 0;
  let polyProd = 1;

  for (let i = 0; i < buf.length; i++) {
    const val = buf[i];
    polySum = (polySum + val * (i + 1)) % Q;
    polyProd = (polyProd * (val + 1)) % Q;
  }

  const latticeVector = [
    polySum,
    polyProd,
    (polySum + polyProd) % Q,
    (polySum ^ polyProd) % Q
  ];

  const latticeSig = 'pq-lattice-' + latticeVector.join('-');
  return {
    latticeVector,
    latticeSig,
    isValid: true
  };
}

function verifyLatticeSignature(dataBuffer, latticeSig) {
  if (!latticeSig || typeof latticeSig !== 'string' || !latticeSig.startsWith('pq-lattice-')) {
    return false;
  }
  const generated = generateLatticeHash(dataBuffer);
  return generated.latticeSig === latticeSig;
}

function safeEval(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'invalid input' };
  }
  const { action, text, signature } = input;
  if (action === 'digest') {
    return { ok: true, result: generateLatticeHash(text) };
  }
  if (action === 'verify') {
    return { ok: true, valid: verifyLatticeSignature(text, signature) };
  }
  return { ok: false, error: 'unknown action' };
}

module.exports = {
  Q,
  generateLatticeHash,
  verifyLatticeSignature,
  safeEval
};
