import fs from 'fs';
import path from 'path';

const messagesDir = path.join(process.cwd(), 'messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

const replacements = [
    { from: /â€”/g, to: '—' },
    { from: /â€“/g, to: '–' },
    { from: /â€™/g, to: '’' },
    { from: /â€œ/g, to: '“' },
    { from: /â€\x9D/g, to: '”' },
    { from: /â€/g, to: '”' }, // Catch-all for remaining â€
    { from: /â€¢/g, to: '•' },
    { from: /Ã¢/g, to: 'â' },
];

for (const file of files) {
    const filePath = path.join(messagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { from, to } of replacements) {
        if (from.test(content)) {
            content = content.replace(from, to);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed mojibake in ${file}`);
    }
}
