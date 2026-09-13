const fs = require('fs');
const rlsSql = fs.readFileSync('D:\\AlparAi\\dehost\\migrations\\0002_rls_policies.sql', 'utf8');

const policyBlocks = rlsSql.match(/create\s+policy\s+"[^"]+"[\s\S]*?;/gi) || [];

console.log(`Total policy blocks found in 0002_rls_policies.sql: ${policyBlocks.length}`);

let matchingBodies = 0;
const nonMatching = [];

for (const block of policyBlocks) {
  if (/on\s+public\.[^\s]+/i.test(block)) {
    matchingBodies++;
  } else {
    nonMatching.push(block);
  }
}

console.log(`Policy blocks matching 'ON public.<table_name>': ${matchingBodies} / ${policyBlocks.length}`);
if (nonMatching.length > 0) {
  console.log('Sample non-matching policy blocks:');
  console.log(nonMatching.slice(0, 5));
}
