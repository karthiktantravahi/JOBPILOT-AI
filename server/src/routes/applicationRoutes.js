import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  updateApplication,
  addNote,
  deleteApplication,
} from '../controllers/applicationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/', validate(createApplicationSchema), createApplication);
router.patch('/:id/status', validate(updateApplicationStatusSchema), updateApplicationStatus);
router.put('/:id', updateApplication);
router.post('/:id/notes', addNote);
router.delete('/:id', deleteApplication);

export default router;
