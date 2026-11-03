import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ENV } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

const app = express();

// Trust proxy for reverse proxies (Cloudflare, Render, Railway, Nginx)
app.set('trust proxy', 1);

// HTTP response compression
app.use(compression());

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Permit frontend communication & CDN assets
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or production client URL or Render domains or requests with no origin
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin === ENV.CLIENT_URL ||
        origin.includes('onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/free tier
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Health check endpoint (for deployment monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'JobPilot AI Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
