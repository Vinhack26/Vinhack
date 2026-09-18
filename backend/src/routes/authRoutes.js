import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me (Protected)
router.get('/me', authenticate, getMe);

export default router;
