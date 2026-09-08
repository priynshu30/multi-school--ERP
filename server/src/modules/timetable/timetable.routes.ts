import { Router } from 'express';
import { TimetableController } from './timetable.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', TimetableController.getClassTimetable);
router.post('/slots', TimetableController.setSlot);
router.delete('/slots/:id', TimetableController.deleteSlot);

export const timetableRoutes = router;
