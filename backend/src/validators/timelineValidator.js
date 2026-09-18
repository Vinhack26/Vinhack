import { z } from 'zod';

export const createEventSchema = z.object({
  eventTitle: z.string().trim().min(3, 'Event title must be at least 3 characters long'),
  description: z.string().optional().default(''),
  eventTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'eventTime must be a valid ISO 8601 date string'
  }),
  eventType: z.enum(['discovery', 'containment', 'investigation', 'recovery', 'communication', 'other'], {
    errorMap: () => ({ message: 'eventType must be discovery, containment, investigation, recovery, communication, or other' })
  })
});

export const updateEventSchema = z.object({
  eventTitle: z.string().trim().min(3).optional(),
  description: z.string().optional(),
  eventTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'eventTime must be a valid ISO 8601 date string'
  }).optional(),
  eventType: z.enum(['discovery', 'containment', 'investigation', 'recovery', 'communication', 'other']).optional()
});

export default {
  createEventSchema,
  updateEventSchema
};
