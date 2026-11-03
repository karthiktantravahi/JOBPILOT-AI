import { Router } from 'express';
import { triggerManualSync, getSyncStatus } from '../controllers/syncController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { syncLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/status', getSyncStatus);
router.post('/manual', authenticate, syncLimiter, triggerManualSync);

export default router;
