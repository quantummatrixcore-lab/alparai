const fs = require('fs');
const path = 'D:\\AlparAi\\dehost\\migrations\\0002_rls_policies.sql';

let sql = fs.readFileSync(path, 'utf8');

// Replace all lowercase `create policy` with uppercase `CREATE POLICY`
sql = sql.replace(/create\s+policy/gi, 'CREATE POLICY');

fs.writeFileSync(path, sql, 'utf8');
console.log('Normalized all policy headers in 0002_rls_policies.sql to uppercase CREATE POLICY.');
