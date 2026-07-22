const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'passage_db',
  multipleStatements: true,
};

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS `' + config.database + '`');
  await connection.end();
}

async function main() {
  await ensureDatabaseExists();

  const connection = await mysql.createConnection(config);
  const migrationsDir = path.resolve(__dirname, '../database/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skipping ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying ${file}`);
    await connection.query(sql);
    await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
  }

  await connection.end();
  console.log('Database migrations complete.');
}

main().catch((error) => {
  console.error('Database migration failed:', error.message);
  process.exit(1);
});
