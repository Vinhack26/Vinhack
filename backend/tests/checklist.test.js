import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

jest.unstable_mockModule('../src/config/database.js', () => ({
  __esModule: true,
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const db = await import('../src/config/database.js');
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Checklist Endpoints', () => {
  let authToken;
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

  beforeAll(() => {
    authToken = jwt.sign(mockUser, env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch checklist tasks and progress percentage', async () => {
    db.query.mockImplementation(async (sql, params) => {
      if (sql.includes('FROM users')) {
        return { rows: [mockUser] };
      }
      if (sql.includes('FROM incidents WHERE id = $1')) {
        return { rows: [{ id: 1, user_id: 1 }] };
      }
      if (sql.includes('FROM checklist_tasks WHERE incident_id = $1 ORDER BY id ASC')) {
        return {
          rows: [
            { id: 1, task: 'Task 1', category: 'containment', status: 'completed' },
            { id: 2, task: 'Task 2', category: 'investigation', status: 'pending' }
          ]
        };
      }
      if (sql.includes('SELECT status FROM checklist_tasks')) {
        return {
          rows: [
            { status: 'completed' },
            { status: 'pending' }
          ]
        };
      }
      return { rows: [] };
    });

    const res = await request(app)
      .get('/api/incidents/1/checklist')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress.total).toEqual(2);
    expect(res.body.data.progress.percentage).toEqual(50);
  });
});
