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

describe('AI Analysis Endpoint', () => {
  let authToken;
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

  beforeAll(() => {
    authToken = jwt.sign(mockUser, env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate structured JSON AI analysis report for an incident', async () => {
    db.query.mockImplementation(async (sql, params) => {
      if (sql.includes('FROM users')) {
        return { rows: [mockUser] };
      }
      if (sql.includes('FROM incidents WHERE id = $1')) {
        return {
          rows: [{
            id: 1,
            user_id: 1,
            title: 'College DB Leak',
            incident_type: 'data_exposure',
            description: 'Database exposed',
            discovery_time: new Date().toISOString(),
            affected_system: 'Student Database',
            possible_data_exposed: ['names', 'email_addresses'],
            current_status: 'suspected',
            actions_already_taken: 'Isolated port'
          }]
        };
      }
      if (sql.includes('SELECT COUNT(*) FROM checklist_tasks')) {
        return { rows: [{ count: '0' }] };
      }
      if (sql.includes('SELECT COUNT(*) FROM notification_drafts')) {
        return { rows: [{ count: '0' }] };
      }
      return { rows: [] };
    });

    const res = await request(app)
      .post('/api/incidents/1/analyze')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.dataCategories).toBeDefined();
    expect(res.body.data.checklist).toBeDefined();
    expect(res.body.data.notificationDraft).toBeDefined();
  });
});
