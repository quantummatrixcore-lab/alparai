const fs = require('fs');
['AIEcosystemRadar.test.tsx', 'FinancialOperations.test.tsx', 'VisitorAnalytics.test.tsx'].forEach(f => {
  const p = 'tests/components/' + f;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/import AIEcosystemRadar from/g, 'import { AIEcosystemRadar } from');
    c = c.replace(/import FinancialOperations from/g, 'import { FinancialOperations } from');
    c = c.replace(/import VisitorAnalytics from/g, 'import { VisitorAnalytics } from');
    fs.writeFileSync(p, c);
    console.log('Fixed test ' + f);
  }
});
