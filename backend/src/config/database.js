import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Create pool instance
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute parameterized query against PostgreSQL pool
 * @param {string} text - SQL Query text
 * @param {Array} params - Array of parameters
 */
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    // Debug logging for query execution
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export default {
  pool,
  query
};
