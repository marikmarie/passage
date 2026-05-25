import mysql from 'mysql2/promise';
import { env } from './env';

// Create a connection pool to MySQL
export const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL Database');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect to MySQL Database:', error);
    process.exit(1);
  }
};
