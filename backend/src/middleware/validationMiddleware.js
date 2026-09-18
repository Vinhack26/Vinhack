import { errorResponse } from '../utils/response.js';

/**
 * Validates incoming request data using Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} target - Location of payload in req
 */
export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', details, 400);
      }
      next(err);
    }
  };
};

export default { validate };
