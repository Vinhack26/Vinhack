import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  analyzeIncident
} from '../controllers/incidentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createIncidentSchema, updateIncidentSchema } from '../validators/incidentValidator.js';

const router = express.Router();

// Protect all incident endpoints
router.use(authenticate);

// GET /api/incidents
router.get('/', getIncidents);

// POST /api/incidents
router.post('/', validate(createIncidentSchema), createIncident);

// GET /api/incidents/:id
router.get('/:id', getIncidentById);

// PATCH /api/incidents/:id
router.patch('/:id', validate(updateIncidentSchema), updateIncident);

// DELETE /api/incidents/:id
router.delete('/:id', deleteIncident);

// POST /api/incidents/:id/analyze
router.post('/:id/analyze', analyzeIncident);

export default router;
