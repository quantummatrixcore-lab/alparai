const fs = require('fs');

function fix(filePath, lineStart, lineEnd) {
    let c = fs.readFileSync(filePath, 'utf8').split('\n');
    let text = c.slice(lineStart, lineEnd).join('\n');
    text = text.replace(/dehost\r?\n\s+\.from\("ai_polls"\)\r?\n\s+\.select\("\*"\)\r?\n\s+\.eq\("is_active", true\)\r?\n\s+\.order\("created_at", \{ ascending: false \}\)\r?\n\s+as any,/,
    '(dehost.from("ai_polls").select("*").eq("is_active", true).order("created_at", { ascending: false }) as any),');
    
    text = text.replace(/dehost\r?\n\s+\.from\("ecosystem_news"\)\r?\n\s+\.select\("id, title_en, title_tr, source, severity, published_at"\)\r?\n\s+\.eq\("is_active", true\)\r?\n\s+\.order\("published_at", \{ ascending: false \}\)\r?\n\s+\.limit\(4\)\r?\n\s+as any,/,
    '(dehost.from("ecosystem_news").select("id, title_en, title_tr, source, severity, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(4) as any),');

    c.splice(lineStart, lineEnd - lineStart, text);
    fs.writeFileSync(filePath, c.join('\n'));
}

fix('src/app/[locale]/dilemmas/page.tsx', 35, 45);
fix('src/app/[locale]/incidents/page.tsx', 100, 115);
