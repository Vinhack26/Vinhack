import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let activePool = null;
let isInMemory = false;

// Create standard real PostgreSQL pool
const realPool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

realPool.on('error', (err) => {
  if (!isInMemory) {
    console.error('Unexpected error on idle PostgreSQL client', err);
  }
});

let memPoolPromise = null;

async function getInMemoryPool() {
  if (memPoolPromise) return memPoolPromise;

  memPoolPromise = (async () => {
    console.log('[DB Info] Initializing in-memory BreachBuddy PostgreSQL database fallback...');
    const { newDb } = await import('pg-mem');
    const db = newDb();

    // Read and apply schema
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.public.none(schemaSql);
    }

    // Read and apply seed data
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      let seedSql = fs.readFileSync(seedPath, 'utf8');
      seedSql = seedSql.replace(/TRUNCATE[^;]+;/gi, '').replace(/SELECT setval[^;]+;/gi, '');
      db.public.none(seedSql);
    }

    const { Pool: MemPool } = db.adapters.createPg();
    const memPoolInstance = new MemPool();
    console.log('[DB Info] In-memory BreachBuddy database ready with schema and seed data.');
    isInMemory = true;
    return memPoolInstance;
  })();

  return memPoolPromise;
}

export const pool = {
  async connect() {
    if (activePool) {
      return activePool.connect();
    }
    try {
      const client = await Promise.race([
        realPool.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL connection timeout')), 1500))
      ]);
      activePool = realPool;
      return client;
    } catch (err) {
      activePool = await getInMemoryPool();
      return activePool.connect();
    }
  },
  async query(text, params) {
    return query(text, params);
  },
  on(event, handler) {
    if (activePool && activePool.on) {
      activePool.on(event, handler);
    } else {
      realPool.on(event, handler);
    }
  }
};

/**
 * Execute parameterized query against active pool (PostgreSQL or fallback)
 * @param {string} text - SQL Query text
 * @param {Array} params - Array of parameters
 */
export const query = async (text, params) => {
  if (!activePool) {
    try {
      const client = await Promise.race([
        realPool.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL connection timeout')), 1200))
      ]);
      activePool = realPool;
      client.release();
    } catch (err) {
      activePool = await getInMemoryPool();
    }
  }

  const start = Date.now();
  const res = await activePool.query(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export default {
  pool,
  query
};
