import { Router } from 'express';
import { HomeworkController } from './homework.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', HomeworkController.listHomework);
router.post('/', HomeworkController.createHomework);
router.get('/:id', HomeworkController.getHomeworkDetails);
router.delete('/:id', HomeworkController.deleteHomework);

export const homeworkRoutes = router;
