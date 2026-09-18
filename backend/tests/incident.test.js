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

describe('Incident Endpoints', () => {
  let authToken;
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

  beforeAll(() => {
    authToken = jwt.sign(mockUser, env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/incidents', () => {
    it('should require authentication token', async () => {
      const res = await request(app).get('/api/incidents');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should return incidents list for authenticated user', async () => {
      db.query.mockImplementation(async (sql, params) => {
        if (sql.includes('FROM users')) {
          return { rows: [mockUser] };
        }
        if (sql.includes('FROM incidents')) {
          return {
            rows: [
              {
                id: 101,
                title: 'Test Breach',
                incident_type: 'data_leak',
                affected_system: 'User DB',
                current_status: 'suspected'
              }
            ]
          };
        }
        return { rows: [] };
      });

      const res = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incidents.length).toEqual(1);
    });
  });

  describe('POST /api/incidents', () => {
    it('should create incident with valid payload', async () => {
      db.query.mockImplementation(async (sql, params) => {
        if (sql.includes('FROM users')) {
          return { rows: [mockUser] };
        }
        if (sql.includes('INSERT INTO incidents')) {
          return {
            rows: [{
              id: 1,
              title: 'College Student Database Exposure',
              current_status: 'suspected',
              created_at: new Date().toISOString()
            }]
          };
        }
        return { rows: [] };
      });

      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'College Student Database Exposure',
          incidentType: 'accidental_data_exposure',
          description: 'Database publicly accessible on port 5432.',
          discoveryTime: '2026-09-18T10:00:00Z',
          affectedSystem: 'Student Database',
          possibleDataExposed: ['names', 'email_addresses'],
          currentStatus: 'suspected',
          actionsAlreadyTaken: 'Isolated port'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incident.title).toEqual('College Student Database Exposure');
    });
  });
});
