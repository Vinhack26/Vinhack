import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/breachbuddy',
  JWT_SECRET: process.env.JWT_SECRET || 'breachbuddy_super_secret_jwt_key_2026_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-2.5-flash',
};
