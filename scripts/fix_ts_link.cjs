const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'typescript');
const realTsPath = path.join(__dirname, '..', 'node_modules', '.pnpm', 'typescript@6.0.3', 'node_modules', 'typescript');

console.log(`Connecting node_modules/typescript to ${realTsPath}...`);

if (fs.existsSync(targetPath)) {
    console.log('Removing incomplete node_modules/typescript directory...');
    fs.rmSync(targetPath, { recursive: true, force: true });
}

fs.symlinkSync(realTsPath, targetPath, 'junction');
console.log('✅ node_modules/typescript successfully linked to complete pnpm store!');
