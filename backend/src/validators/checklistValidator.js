import { z } from 'zod';

export const createTaskSchema = z.object({
  task: z.string().trim().min(3, 'Task description must be at least 3 characters long'),
  category: z.enum(['containment', 'investigation', 'recovery', 'communication'], {
    errorMap: () => ({ message: 'Category must be containment, investigation, recovery, or communication' })
  }),
  priority: z.enum(['high', 'medium', 'low']).default('medium')
});

export const updateTaskSchema = z.object({
  task: z.string().trim().min(3).optional(),
  category: z.enum(['containment', 'investigation', 'recovery', 'communication']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional()
});

export default {
  createTaskSchema,
  updateTaskSchema
};
