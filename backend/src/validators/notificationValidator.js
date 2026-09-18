import { z } from 'zod';

export const updateNotificationSchema = z.object({
  subject: z.string().trim().min(3).optional(),
  body: z.string().trim().min(5).optional(),
  verifiedInformation: z.array(z.string()).optional()
});

export default {
  updateNotificationSchema
};
