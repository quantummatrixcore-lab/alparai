const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pkgJsonPath = path.join(rootDir, 'package.json');
const nodeModulesPath = path.join(rootDir, 'node_modules');
const pnpmStorePath = path.join(nodeModulesPath, '.pnpm');

if (!fs.existsSync(pkgJsonPath) || !fs.existsSync(pnpmStorePath)) {
    console.error('package.json or .pnpm store not found!');
    process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
const allDeps = {
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {})
};

console.log(`Auditing ${Object.keys(allDeps).length} declared dependencies against .pnpm store...`);

const pnpmEntries = fs.readdirSync(pnpmStorePath);
let restoredCount = 0;

for (const dep of Object.keys(allDeps)) {
    const isScoped = dep.startsWith('@');
    let scope = '';
    let name = dep;

    if (isScoped) {
        [scope, name] = dep.split('/');
    }

    // pnpm encodes scoped packages as @scope+name@version
    const pnpmPrefix = isScoped ? `${scope}+${name}@` : `${name}@`;
    
    // Find matching entry in .pnpm
    const match = pnpmEntries.find(entry => entry.startsWith(pnpmPrefix));
    if (!match) {
        // Skip if not in store
        continue;
    }

    const realPkgPath = path.join(pnpmStorePath, match, 'node_modules', dep);
    if (!fs.existsSync(realPkgPath)) {
        continue;
    }

    const targetLinkPath = path.join(nodeModulesPath, dep);

    // Check if targetLinkPath is already a valid symlink or needs restoring
    let needsRestore = false;

    if (!fs.existsSync(targetLinkPath)) {
        needsRestore = true;
    } else {
        const lstat = fs.lstatSync(targetLinkPath);
        if (!lstat.isSymbolicLink()) {
            // It's a regular directory! Check if package.json is missing or corrupted
            const innerPkg = path.join(targetLinkPath, 'package.json');
            if (!fs.existsSync(innerPkg)) {
                needsRestore = true;
            }
        }
    }

    if (needsRestore) {
        try {
            if (fs.existsSync(targetLinkPath)) {
                fs.rmSync(targetLinkPath, { recursive: true, force: true });
            }

            if (isScoped) {
                const scopeDir = path.join(nodeModulesPath, scope);
                if (!fs.existsSync(scopeDir)) {
                    fs.mkdirSync(scopeDir, { recursive: true });
                }
            }

            fs.symlinkSync(realPkgPath, targetLinkPath, 'junction');
            console.log(`[RESTORED] ${dep} -> ${match}`);
            restoredCount++;
        } catch (e) {
            console.error(`[FAIL] ${dep}: ${e.message}`);
        }
    }
}

console.log(`\n🎉 TOTAL RESTORED PNPM JUNCTIONS: ${restoredCount}`);
