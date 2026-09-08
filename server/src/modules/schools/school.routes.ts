import { Router } from 'express';
import { SchoolController } from './school.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requireRole } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createSchoolSchema,
  updateSchoolSchema,
  schoolQuerySchema,
} from './school.validation.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// Current school details & stats (for logged in school users)
router.get('/current', requireTenant, SchoolController.getCurrentSchool);
router.put('/current', requireTenant, SchoolController.updateCurrentSchool);
router.get('/current/stats', requireTenant, SchoolController.getCurrentSchoolStats);

// Platform telemetry (Super Admin)
router.get('/stats/platform', requireRole(ROLES.SUPER_ADMIN), SchoolController.getPlatformStats);

// Super Admin school management endpoints
router.get(
  '/',
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({ query: schoolQuerySchema }),
  SchoolController.listSchools
);

router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({ body: createSchoolSchema }),
  SchoolController.createSchool
);

router.get('/:id', requireRole(ROLES.SUPER_ADMIN), SchoolController.getSchoolById);

router.patch(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({ body: updateSchoolSchema }),
  SchoolController.updateSchool
);

router.post('/:id/activate', requireRole(ROLES.SUPER_ADMIN), SchoolController.activateSchool);
router.post('/:id/suspend', requireRole(ROLES.SUPER_ADMIN), SchoolController.suspendSchool);
router.post('/:id/archive', requireRole(ROLES.SUPER_ADMIN), SchoolController.archiveSchool);

export const schoolRoutes = router;
