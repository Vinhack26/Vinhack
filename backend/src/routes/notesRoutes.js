import express from 'express';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createNoteSchema, updateNoteSchema } from '../validators/notesValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Mounted under /api/incidents/:id/notes
router.get('/', getNotes);
router.post('/', validate(createNoteSchema), createNote);

// Separate router for direct note operations mounted under /api/notes
export const noteRouter = express.Router();
noteRouter.use(authenticate);
noteRouter.patch('/:noteId', validate(updateNoteSchema), updateNote);
noteRouter.delete('/:noteId', deleteNote);

export default router;
