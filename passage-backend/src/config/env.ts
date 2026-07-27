import dotenv from 'dotenv';
import path from 'path';

// Load .env variables. `quiet` suppresses dotenv v17's startup banner, which
// would otherwise be written to stdout and corrupt the JSON response envelope
// the PHP bridge reads (see src/cli-guard.ts and deploy/node.php).
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export const env = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'passage_db',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_key_123',
  TOKEN_SECRET: process.env.TOKEN_SECRET || process.env.JWT_SECRET || 'super_secret_key_123',
  ORS_API_KEY: process.env.ORS_API_KEY || '',
  ORS_BASE_URL: process.env.ORS_BASE_URL || 'https://api.openrouteservice.org',
};
