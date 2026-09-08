import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createUserSchema,
  userQuerySchema,
} from './user.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(PERMISSIONS.USERS_VIEW),
  validateRequest({ query: userQuerySchema }),
  UserController.listUsers
);

router.post(
  '/',
  requirePermission(PERMISSIONS.USERS_CREATE),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.USERS_VIEW),
  UserController.getUserById
);

router.post(
  '/:id/activate',
  requirePermission(PERMISSIONS.USERS_ACTIVATE),
  UserController.activateUser
);

router.post(
  '/:id/deactivate',
  requirePermission(PERMISSIONS.USERS_DEACTIVATE),
  UserController.deactivateUser
);

export const userRoutes = router;
