const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'src'));
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('next/navigation.js')) {
        content = content.replace(/next\/navigation\.js/g, 'next/navigation');
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('Fixed:', file);
    }
});

console.log('Total files fixed:', fixedCount);
