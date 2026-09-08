import { Router } from 'express';
import { ParentController } from './parent.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createParentSchema,
  updateParentSchema,
  linkChildSchema,
} from './parent.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(PERMISSIONS.PARENTS_VIEW),
  ParentController.listParents
);

router.post(
  '/',
  requirePermission(PERMISSIONS.PARENTS_CREATE),
  validateRequest({ body: createParentSchema }),
  ParentController.createParent
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.PARENTS_VIEW),
  ParentController.getParentById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  validateRequest({ body: updateParentSchema }),
  ParentController.updateParent
);

router.post(
  '/:id/link-child',
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  validateRequest({ body: linkChildSchema }),
  ParentController.linkChild
);

router.delete(
  '/:id/unlink-child/:studentId',
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  ParentController.unlinkChild
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.PARENTS_DELETE),
  ParentController.deleteParent
);

export const parentRoutes = router;
