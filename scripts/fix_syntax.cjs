const fs = require('fs');

function wrapAsAny(file, searchStr) {
    let c = fs.readFileSync(file, 'utf8');
    const idx = c.indexOf(searchStr);
    if (idx !== -1) {
        c = c.slice(0, idx) + '(' + c.slice(idx).replace(' as any,', ') as any,');
        fs.writeFileSync(file, c);
    }
}

wrapAsAny('src/app/[locale]/dilemmas/page.tsx', 'dehost\n      .from("ai_polls")\n      .select("*")');
wrapAsAny('src/app/[locale]/incidents/page.tsx', 'dehost\n      .from("ecosystem_news")');
