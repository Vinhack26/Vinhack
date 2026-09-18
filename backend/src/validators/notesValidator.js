import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters long'),
  content: z.string().trim().min(3, 'Content must be at least 3 characters long'),
  logReference: z.string().optional().default('')
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(2).optional(),
  content: z.string().trim().min(3).optional(),
  logReference: z.string().optional()
});

export default {
  createNoteSchema,
  updateNoteSchema
};
