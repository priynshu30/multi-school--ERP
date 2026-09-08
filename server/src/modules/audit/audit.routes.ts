import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/rbacMiddleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(ROLES.SUPER_ADMIN));

router.get('/', AuditController.getAuditLogs);

export const auditRoutes = router;
