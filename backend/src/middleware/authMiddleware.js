import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/response.js';
import { query } from '../config/database.js';

/**
 * Protect routes by verifying JWT in Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required. Please provide a valid Authorization header.', 'UNAUTHORIZED', [], 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Invalid token format.', 'UNAUTHORIZED', [], 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Optional: double check user exists in DB
    const result = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'User associated with this token no longer exists.', 'UNAUTHORIZED', [], 401);
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', 'TOKEN_EXPIRED', [], 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid authentication token.', 'UNAUTHORIZED', [], 401);
    }
    return errorResponse(res, 'Authentication failure.', 'UNAUTHORIZED', [], 401);
  }
};

export default { authenticate };
