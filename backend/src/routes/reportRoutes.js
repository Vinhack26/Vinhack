import express from 'express';
import { downloadPDFReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// GET /api/incidents/:id/report/pdf
router.get('/pdf', downloadPDFReport);

export default router;
