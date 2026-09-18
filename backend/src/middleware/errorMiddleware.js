import { errorResponse } from '../utils/response.js';
import { ZodError } from 'zod';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log unexpected errors
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Error:', err);
  }

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return errorResponse(res, 'Validation failed for request parameters', 'VALIDATION_ERROR', formattedDetails, 400);
  }

  // PostgreSQL Duplicate Key Error
  if (err.code === '23505') {
    return errorResponse(res, 'A record with this information already exists.', 'DUPLICATE_RESOURCE', [], 409);
  }

  // PostgreSQL Foreign Key Violation Error
  if (err.code === '23503') {
    return errorResponse(res, 'Referenced record does not exist.', 'FOREIGN_KEY_VIOLATION', [], 400);
  }

  // PostgreSQL Invalid Input Syntax (e.g., bad integer ID)
  if (err.code === '22P02') {
    return errorResponse(res, 'Invalid data type or ID parameter format.', 'BAD_REQUEST', [], 400);
  }

  // Custom App Status Code Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return errorResponse(res, message, code, [], statusCode);
};

/**
 * 404 Route Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND', [], 404);
};

export default {
  errorHandler,
  notFoundHandler
};
