const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'next');
const pnpmStoreDir = path.join(__dirname, '..', 'node_modules', '.pnpm');

console.log('Searching for real next package in .pnpm...');
const entries = fs.readdirSync(pnpmStoreDir);
const nextEntry = entries.find(e => e.startsWith('next@16.2.12_'));

if (!nextEntry) {
    console.error('Real next package not found in .pnpm!');
    process.exit(1);
}

const realNextPath = path.join(pnpmStoreDir, nextEntry, 'node_modules', 'next');
console.log(`Found real next package at: ${realNextPath}`);

if (fs.existsSync(targetPath)) {
    console.log('Removing corrupted node_modules/next directory...');
    fs.rmSync(targetPath, { recursive: true, force: true });
}

console.log('Creating junction from real next to node_modules/next...');
fs.symlinkSync(realNextPath, targetPath, 'junction');
console.log('✅ node_modules/next successfully linked to real next installation!');
