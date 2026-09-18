import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database.');
    client.release();
  } catch (err) {
    console.warn('[DB Warning] Database connection check failed on startup:', err.message);
    console.warn('[DB Warning] Ensure PostgreSQL is running and DATABASE_URL is correctly set.');
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` BreachBuddy API Backend Server Running `);
    console.log(` Environment : ${env.NODE_ENV}`);
    console.log(` Port        : ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();
