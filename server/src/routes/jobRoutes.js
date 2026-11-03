import { Router } from 'express';
import { getJobs, getRecommendedJobs, getJobById } from '../controllers/jobController.js';
import { optionalAuth, authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getJobs);
router.get('/recommended', authenticate, getRecommendedJobs);
router.get('/:id', optionalAuth, getJobById);

export default router;
