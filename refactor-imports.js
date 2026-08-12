const fs = require('fs');
const path = require('path');

const adminDir = path.join('d:', 'Alparai', 'src', 'app', '[locale]', 'admin');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(adminDir);
console.log('Found ' + files.length + ' files in admin dir');
let refactoredCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  const regex = /import\s+\{([^}]+)\}\s+from\s+[\"']@\/(components\/admin\/[^\"']+|app\/\[locale\]\/admin\/[^\"']+)[\"'];/g;
  
  const heavyComponents = [
    'UsersClient', 'ModelHealthChart', 'ApiMetricsClient', 'AuditLogClient', 
    'CronHealthClient', 'CrossAuditDashboardClient', 'DualChannelChart', 
    'CostTrendChart', 'GrantsList', 'ImportQueueClient', 'LinkedinContactsList', 
    'MetricCardChart', 'PlatformsList', 'SocialDashboardClient', 'RiskMatrixClient', 
    'VendorSlaCharts', 'CategoryGroup', 'EcosystemMap', 'ServiceBlock', 
    'MasterPlanClient', 'MasterPlanDashboard', 'MasterPlanDepsTable', 
    'ModularArchitectureView', 'Sidebar', 'StatsCards', 'StrategyTabs', 
    'SwotBoardClient', 'PollCard', 'FeedCard', 'VelocityMetricsCard'
  ];
  
  content = content.replace(regex, (match, namedImports, modulePath) => {
    const names = namedImports.split(',').map(n => n.trim());
    const heavyNames = names.filter(n => heavyComponents.includes(n));
    const regularNames = names.filter(n => !heavyComponents.includes(n));
    
    if (heavyNames.length === 0) return match;
    
    let replacement = '';
    if (regularNames.length > 0) {
      replacement += `import { ${regularNames.join(', ')} } from \"@/${modulePath}\";\n`;
    }
    
    heavyNames.forEach(name => {
      replacement += `const ${name} = dynamic(() => import(\"@/${modulePath}\").then(m => m.${name}), { ssr: false });\n`;
    });
    
    return replacement;
  });
  
  if (content !== originalContent) {
    if (!content.includes('import dynamic from \"next/dynamic\"')) {
      content = 'import dynamic from \"next/dynamic\";\n' + content;
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refactored ' + file);
    refactoredCount++;
  }
});

console.log('Refactored ' + refactoredCount + ' files.');
