import { jest } from '@jest/globals';

// Use unstable_mockModule before importing app
jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const db = await import('../src/config/database.js');
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      db.query.mockImplementation(async (sql, params) => {
        if (sql.includes('SELECT id FROM users')) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO users')) {
          return {
            rows: [{
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              created_at: new Date().toISOString()
            }]
          };
        }
        return { rows: [] };
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toEqual('john@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail registration on invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject non-existent email', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('INVALID_CREDENTIALS');
    });
  });
});
