import { Router } from 'express';
import { NoticeController } from './notice.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/', NoticeController.listNotices);
router.post('/', NoticeController.createNotice);
router.delete('/:id', NoticeController.deleteNotice);

export const noticeRoutes = router;
