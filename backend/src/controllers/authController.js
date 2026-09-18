import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return errorResponse(res, 'User with this email already exists.', 'EMAIL_IN_USE', [], 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return successResponse(
      res,
      'User registered successfully',
      {
        user,
        token
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid email or password.', 'INVALID_CREDENTIALS', [], 401);
    }

    const user = result.rows[0];

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 'INVALID_CREDENTIALS', [], 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Return sanitized user object (never return password hash)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    };

    return successResponse(
      res,
      'Login successful',
      {
        user: userResponse,
        token
      },
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return successResponse(res, 'User profile retrieved', { user: req.user });
};

export default {
  register,
  login,
  getMe
};
