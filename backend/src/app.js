import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import checklistRoutes, { taskRouter } from './routes/checklistRoutes.js';
import timelineRoutes, { eventRouter } from './routes/timelineRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notesRoutes, { noteRouter } from './routes/notesRoutes.js';
import evidenceRoutes, { singleEvidenceRouter } from './routes/evidenceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Security Middlewares
app.use(helmet());

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:8443',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8443'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked origin: ' + origin));
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: []
    }
  }
});

app.use(limiter);

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BreachBuddy API Service Operational',
    timestamp: new Date().toISOString()
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Nested Sub-Resource Routes
app.use('/api/incidents/:id/checklist', checklistRoutes);
app.use('/api/checklist', taskRouter);

app.use('/api/incidents/:id/timeline', timelineRoutes);
app.use('/api/timeline', eventRouter);

app.use('/api/incidents/:id/notification', notificationRoutes);

app.use('/api/incidents/:id/notes', notesRoutes);
app.use('/api/notes', noteRouter);

app.use('/api/incidents/:id/evidence', evidenceRoutes);
app.use('/api/evidence', singleEvidenceRouter);

app.use('/api/incidents/:id/report', reportRoutes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
