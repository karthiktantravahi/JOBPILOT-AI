import { Router } from 'express';
import { getProfile, updateProfile, updateMatchSettings } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateProfileSchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.put('/match-settings', updateMatchSettings);

export default router;
