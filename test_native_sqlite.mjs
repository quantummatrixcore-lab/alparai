import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('alparai_test.db');
db.exec('CREATE TABLE IF NOT EXISTS matrix (id INTEGER PRIMARY KEY, msg TEXT)');
const stmt = db.prepare('INSERT INTO matrix (msg) VALUES (?)');
stmt.run('Oturum yesil. Native SQLite Node v24.');
const rows = db.prepare('SELECT * FROM matrix').all();
console.log('SQLITE_TEST_RUN_GREEN:', rows);
