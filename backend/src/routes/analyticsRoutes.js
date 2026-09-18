import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// GET /api/analytics/dashboard
router.get('/dashboard', getDashboardStats);

export default router;
