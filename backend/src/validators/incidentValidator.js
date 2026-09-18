import { z } from 'zod';

export const createIncidentSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters long'),
  incidentType: z.string().trim().min(2, 'Incident type is required'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters long'),
  discoveryTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'discoveryTime must be a valid ISO 8601 date string'
  }),
  affectedSystem: z.string().trim().min(2, 'Affected system is required'),
  possibleDataExposed: z.array(z.string()).default([]),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  currentStatus: z.enum(['suspected', 'investigating', 'contained', 'resolved']).default('suspected'),
  actionsAlreadyTaken: z.string().optional().default('')
});

export const updateIncidentSchema = z.object({
  title: z.string().trim().min(3).optional(),
  incidentType: z.string().trim().min(2).optional(),
  description: z.string().trim().min(5).optional(),
  discoveryTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'discoveryTime must be a valid ISO 8601 date string'
  }).optional(),
  affectedSystem: z.string().trim().min(2).optional(),
  possibleDataExposed: z.array(z.string()).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  currentStatus: z.enum(['suspected', 'investigating', 'contained', 'resolved']).optional(),
  actionsAlreadyTaken: z.string().optional()
});

export default {
  createIncidentSchema,
  updateIncidentSchema
};
