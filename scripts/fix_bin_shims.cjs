const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'node_modules', '.bin');

if (!fs.existsSync(binDir)) {
    console.error('.bin directory does not exist!');
    process.exit(1);
}

const files = fs.readdirSync(binDir);
console.log(`Found ${files.length} items in node_modules/.bin. Restoring shims...`);

let restored = 0;

for (const file of files) {
    // Matches .name.cmd-HASH or .name.ps1-HASH or .name-HASH
    let targetName = null;
    
    if (file.startsWith('.')) {
        if (file.includes('.cmd-')) {
            const base = file.replace(/^\./, '').split('.cmd-')[0];
            targetName = `${base}.cmd`;
        } else if (file.includes('.ps1-')) {
            const base = file.replace(/^\./, '').split('.ps1-')[0];
            targetName = `${base}.ps1`;
        } else if (file.includes('-')) {
            // E.g. .cross-env-Bzp1AGoj -> cross-env
            const parts = file.replace(/^\./, '').split('-');
            parts.pop(); // remove hash
            targetName = parts.join('-');
        }
    }

    if (targetName) {
        const srcPath = path.join(binDir, file);
        const destPath = path.join(binDir, targetName);
        try {
            fs.copyFileSync(srcPath, destPath);
            restored++;
        } catch (e) {
            console.error(`Failed to copy ${file} -> ${targetName}: ${e.message}`);
        }
    }
}

console.log(`✅ Successfully restored ${restored} binary shims in node_modules/.bin!`);
