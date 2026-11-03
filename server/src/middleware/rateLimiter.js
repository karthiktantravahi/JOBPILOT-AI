import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // limit login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

export const syncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10, // limit manual sync calls
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Job synchronization can only be requested a few times per 5 minutes.',
  },
});
