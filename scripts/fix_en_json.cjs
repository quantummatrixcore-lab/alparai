const fs = require('fs');
const path = 'messages/en.json';
let c = JSON.parse(fs.readFileSync(path, 'utf8'));
c.marketing.why_stat_4_display = '$0';
fs.writeFileSync(path, JSON.stringify(c, null, 2));
console.log('Fixed why_stat_4_display:', c.marketing.why_stat_4_display);
