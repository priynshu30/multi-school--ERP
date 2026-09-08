import { Router } from 'express';
import { TeacherController } from './teacher.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createTeacherSchema,
  updateTeacherSchema,
  teacherQuerySchema,
} from './teacher.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(PERMISSIONS.TEACHERS_VIEW),
  validateRequest({ query: teacherQuerySchema }),
  TeacherController.listTeachers
);

router.post(
  '/',
  requirePermission(PERMISSIONS.TEACHERS_CREATE),
  validateRequest({ body: createTeacherSchema }),
  TeacherController.createTeacher
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.TEACHERS_VIEW),
  TeacherController.getTeacherById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.TEACHERS_UPDATE),
  validateRequest({ body: updateTeacherSchema }),
  TeacherController.updateTeacher
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.TEACHERS_DELETE),
  TeacherController.deleteTeacher
);

export const teacherRoutes = router;
