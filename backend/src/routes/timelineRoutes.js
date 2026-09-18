import express from 'express';
import {
  getTimeline,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/timelineController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createEventSchema, updateEventSchema } from '../validators/timelineValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted under /api/incidents/:id/timeline
router.get('/', getTimeline);
router.post('/', validate(createEventSchema), createEvent);

// Separate router for direct event operations mounted under /api/timeline
export const eventRouter = express.Router();
eventRouter.use(authenticate);
eventRouter.patch('/:eventId', validate(updateEventSchema), updateEvent);
eventRouter.delete('/:eventId', deleteEvent);

export default router;
