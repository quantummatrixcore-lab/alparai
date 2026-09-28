const fs = require('fs');
const fileContent = fs.readFileSync('D:/001-AGI/data/alparai_route_map.json', 'utf8');
const cleanContent = fileContent.replace(/^\uFEFF/, '');
const data = JSON.parse(cleanContent);
const m = data.locale_pages.filter(p => p.category === 'marketing' && p.static_html_feasible === 'YES_FULL');
console.log(JSON.stringify(m.slice(0, 5), null, 2));
