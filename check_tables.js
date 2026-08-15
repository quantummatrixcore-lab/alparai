const fs = require('fs');
const txt = fs.readFileSync('typecheck_output_old.txt', 'utf16le');
const matches = txt.match(/Argument of type '"([^"]+)"' is not assignable to parameter of type/g);
if (matches) {
    const tables = [...new Set(matches.map(m => m.match(/'"([^"]+)"'/)[1]))];
    console.log('Missing tables in old:', tables);
} else {
    console.log('No matches');
}
