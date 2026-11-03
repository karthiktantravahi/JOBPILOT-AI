import { Router } from 'express';
import { register, login, getMe, updatePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/update-password', authenticate, updatePassword);

export default router;
