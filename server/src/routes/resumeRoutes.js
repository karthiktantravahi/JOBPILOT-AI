import { Router } from 'express';
import {
  uploadAndParseResume,
  confirmResumeExtraction,
  getResume,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadResume.single('resume'), uploadAndParseResume);
router.post('/confirm', confirmResumeExtraction);
router.get('/', getResume);

export default router;
