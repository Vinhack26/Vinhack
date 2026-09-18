import express from 'express';
import {
  getEvidence,
  createEvidence,
  deleteEvidence
} from '../controllers/evidenceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createEvidenceSchema } from '../validators/evidenceValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted under /api/incidents/:id/evidence
router.get('/', getEvidence);
router.post('/', validate(createEvidenceSchema), createEvidence);

// Separate router for direct evidence operations mounted under /api/evidence
export const singleEvidenceRouter = express.Router();
singleEvidenceRouter.use(authenticate);
singleEvidenceRouter.delete('/:evidenceId', deleteEvidence);

export default router;
