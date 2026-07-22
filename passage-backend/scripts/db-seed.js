const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'passage_db',
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function upsertUser(connection, user) {
  await connection.query(
    `
      INSERT INTO users (name, email, phone_number, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone_number = VALUES(phone_number),
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        status = 'active'
    `,
    [user.name, user.email, user.phone_number, hashPassword(user.password), user.role]
  );

  const [rows] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [user.email]);
  return rows[0].id;
}

async function main() {
  const connection = await mysql.createConnection(config);

  const parentId = await upsertUser(connection, {
    name: 'Sarah Nakato',
    email: 'parent@example.com',
    phone_number: '+256700000101',
    password: 'password123',
    role: 'parent',
  });

  await upsertUser(connection, {
    name: 'Daniel Rider',
    email: 'rider.approved@example.com',
    phone_number: '+256700000202',
    password: 'password123',
    role: 'rider',
  });

  await upsertUser(connection, {
    name: 'Pending Rider',
    email: 'rider.pending@example.com',
    phone_number: '+256700000303',
    password: 'password123',
    role: 'rider',
  });

  await connection.query(
    `
      INSERT INTO devices (imei, sim_number, firmware_version, battery_level, status, current_state, last_online_at)
      VALUES ('PASSAGE-DEMO-001', '+256700000404', '1.0.0', 92, 'active', 'IDLE_READY', NOW())
      ON DUPLICATE KEY UPDATE
        sim_number = VALUES(sim_number),
        firmware_version = VALUES(firmware_version),
        battery_level = VALUES(battery_level),
        status = VALUES(status),
        current_state = VALUES(current_state),
        last_online_at = VALUES(last_online_at)
    `
  );

  const [deviceRows] = await connection.query('SELECT id FROM devices WHERE imei = ? LIMIT 1', ['PASSAGE-DEMO-001']);
  const deviceId = deviceRows[0].id;

  await connection.query(
    `
      INSERT INTO kids (parent_user_id, device_id, name, age, school, grade)
      VALUES (?, ?, 'Amina Nakato', 9, 'Greenhill School', 'Primary 4')
      ON DUPLICATE KEY UPDATE
        parent_user_id = VALUES(parent_user_id),
        name = VALUES(name),
        age = VALUES(age),
        school = VALUES(school),
        grade = VALUES(grade)
    `,
    [parentId, deviceId]
  );

  await connection.end();

  console.log('Database seed complete.');
  console.log('Parent login: parent@example.com / password123');
  console.log('Approved rider login: rider.approved@example.com / password123');
  console.log('Pending rider login: rider.pending@example.com / password123');
}

main().catch((error) => {
  console.error('Database seed failed:', error.message);
  process.exit(1);
});
