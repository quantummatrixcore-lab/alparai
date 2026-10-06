const fs = require('fs');

function fix(filePath, line, oldText, newText) {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    if (lines[line - 1].includes(oldText)) {
        lines[line - 1] = lines[line - 1].replace(oldText, newText);
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log('Fixed', filePath, 'line', line);
    }
}

fix('src/app/[locale]/ai-act/page.tsx', 143, 'p.name', '(p as any).name');
fix('src/app/[locale]/ai-act/page.tsx', 144, 'p.slug', '(p as any).slug');
fix('src/app/api/v1/oecd/feed/route.ts', 42, 'provider?.name', '(provider as any)?.name');
fix('src/lib/dehost/server-adapter.ts', 20, 'sqliteInstance.query', '(sqliteInstance as any).query');
