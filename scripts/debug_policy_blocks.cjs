const fs = require('fs');
const rlsSql = fs.readFileSync('D:\\AlparAi\\dehost\\migrations\\0002_rls_policies.sql', 'utf8');

const policyBlocks = rlsSql.split(/create\s+policy/gi).slice(1);
console.log(`Extracted ${policyBlocks.length} policy blocks.`);

let validCount = 0;
const invalidBlocks = [];

for (let i = 0; i < policyBlocks.length; i++) {
  const block = policyBlocks[i];
  if (/\bon\s+["`]?([a-z0-9_]+)["`]?\./i.test(block)) {
    validCount++;
  } else {
    invalidBlocks.push({ index: i + 1, snippet: block.slice(0, 150) });
  }
}

console.log(`Valid policy blocks matching ON <schema>.<table_name>: ${validCount} / ${policyBlocks.length}`);
if (invalidBlocks.length > 0) {
  console.log('Sample unmatched policy blocks:');
  console.log(invalidBlocks.slice(0, 10));
}
