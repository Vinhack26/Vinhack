import express from 'express';
import {
  getChecklist,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/checklistController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/checklistValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted under /api/incidents/:id/checklist
router.get('/', getChecklist);
router.post('/', validate(createTaskSchema), createTask);

// Separate router for direct task operations mounted under /api/checklist
export const taskRouter = express.Router();
taskRouter.use(authenticate);
taskRouter.patch('/:taskId', validate(updateTaskSchema), updateTask);
taskRouter.delete('/:taskId', deleteTask);

export default router;
