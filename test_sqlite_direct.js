import Database from 'better-sqlite3';
const db = new Database('alparai_data.db');
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS test_matrix (id INTEGER PRIMARY KEY, val TEXT)');
const stmt = db.prepare('INSERT INTO test_matrix (val) VALUES (?)');
stmt.run('omega_spark');
const rows = db.prepare('SELECT * FROM test_matrix').all();
console.log('SQLite Test Run: GREEN', rows);
