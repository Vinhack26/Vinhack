import express from 'express';
import {
  generateNotification,
  getNotification,
  updateNotification
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateNotificationSchema } from '../validators/notificationValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted under /api/incidents/:id/notification
router.post('/generate', generateNotification);
router.get('/', getNotification);
router.patch('/', validate(updateNotificationSchema), updateNotification);

export default router;
