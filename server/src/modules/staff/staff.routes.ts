import { Router } from 'express';
import { StaffController } from './staff.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createStaffSchema,
  updateStaffSchema,
  staffQuerySchema,
} from './staff.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(PERMISSIONS.STAFF_VIEW),
  validateRequest({ query: staffQuerySchema }),
  StaffController.listStaff
);

router.post(
  '/',
  requirePermission(PERMISSIONS.STAFF_CREATE),
  validateRequest({ body: createStaffSchema }),
  StaffController.createStaff
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_VIEW),
  StaffController.getStaffById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_UPDATE),
  validateRequest({ body: updateStaffSchema }),
  StaffController.updateStaff
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_DELETE),
  StaffController.deleteStaff
);

export const staffRoutes = router;
