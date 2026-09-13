const fs = require('fs');
const schemaPath = 'D:\\AlparAi\\dehost\\migrations\\0001_full_schema.sql';

let sql = fs.readFileSync(schemaPath, 'utf8');

const targetGuard = `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'dehost_realtime') THEN CREATE PUBLICATION dehost_realtime; END IF; END $$;`;

sql = sql.replace(/DO \$.*pubname = 'dehost_realtime'.*\$;/g, targetGuard);

fs.writeFileSync(schemaPath, sql, 'utf8');
console.log('Fixed publication guard in 0001_full_schema.sql.');
