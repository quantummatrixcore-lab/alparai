import fs from 'fs';

const files = ['AIEcosystemRadar.test.tsx', 'FinancialOperations.test.tsx', 'VisitorAnalytics.test.tsx'];

files.forEach(f => {
  const p = 'tests/components/' + f;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/^import Default[A-Za-z]+ from .*$/gm, '');
    fs.writeFileSync(p, c);
    console.log('Cleaned test ' + p);
  }
});
