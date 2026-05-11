import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = fs.readFileSync('add-password-reset.sql', 'utf8');

try {
  await pool.query(sql);
  console.log('✅ Migration applied successfully');
  await pool.end();
} catch (err) {
  console.error('❌ Migration error:', err);
  await pool.end();
  process.exit(1);
}
