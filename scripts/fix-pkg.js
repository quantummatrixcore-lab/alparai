const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Fix lint script (remove || exit 0 and add NODE_OPTIONS)
pkg.scripts.lint = 'cross-env NODE_OPTIONS="--max-old-space-size=2048" eslint .';
pkg.scripts['lint:fix'] = 'cross-env NODE_OPTIONS="--max-old-space-size=2048" eslint . --fix';

// Fix tsc command if missing max-old-space-size
pkg.scripts.typecheck = 'cross-env NODE_OPTIONS="--max-old-space-size=2048" tsc --noEmit';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('package.json updated');
