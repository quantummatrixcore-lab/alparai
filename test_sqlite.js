const { getDeHostPgPool } = require('./src/lib/dehost/server-adapter');
async function test() {
  const db = getDeHostPgPool();
  db.query('CREATE TABLE IF NOT EXISTS test_matrix (id INTEGER PRIMARY KEY, val TEXT)');
  db.query('INSERT INTO test_matrix (val) VALUES ()', ['omega_spark']);
  const res = await db.query('SELECT * FROM test_matrix');
  console.log('SQLite Test Run:', res.rows);
}
test().catch(console.error);
