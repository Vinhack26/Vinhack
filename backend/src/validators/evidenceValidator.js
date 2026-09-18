import { z } from 'zod';

export const createEvidenceSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters long'),
  description: z.string().optional().default(''),
  referenceType: z.string().trim().min(2, 'Reference type is required'),
  referenceValue: z.string().trim().min(1, 'Reference value is required')
});

export default {
  createEvidenceSchema
};
