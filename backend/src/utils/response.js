/**
 * Sends a standardized success HTTP response
 * @param {import('express').Response} res
 * @param {string} message - Descriptive message
 * @param {any} data - Response payload or object
 * @param {number} statusCode - HTTP Status code (default: 200)
 */
export const successResponse = (res, message = 'Operation successful', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a standardized error HTTP response
 * @param {import('express').Response} res
 * @param {string} message - User friendly error message
 * @param {string} code - Error code identifier (e.g. VALIDATION_ERROR, NOT_FOUND)
 * @param {Array|object} details - Additional error details or field errors
 * @param {number} statusCode - HTTP Status code (default: 500)
 */
export const errorResponse = (res, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details
    }
  });
};

export default {
  successResponse,
  errorResponse
};
