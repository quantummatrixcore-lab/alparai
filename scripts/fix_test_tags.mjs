import fs from 'fs';

const files = ['AIEcosystemRadar.test.tsx', 'FinancialOperations.test.tsx', 'VisitorAnalytics.test.tsx'];

files.forEach(f => {
  const p = 'tests/components/' + f;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/DefaultAIEcosystemRadar/g, 'AIEcosystemRadar');
    c = c.replace(/DefaultFinancialOperations/g, 'FinancialOperations');
    c = c.replace(/DefaultVisitorAnalytics/g, 'VisitorAnalytics');
    fs.writeFileSync(p, c);
    console.log('Fixed tags in test ' + p);
  }
});
