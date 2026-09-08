import { Router } from 'express';
import { StudentController } from './student.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createStudentSchema,
  updateStudentSchema,
  updateStudentStatusSchema,
} from './student.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  '/',
  requirePermission(PERMISSIONS.STUDENTS_VIEW),
  StudentController.listStudents
);

router.get(
  '/stats',
  requirePermission(PERMISSIONS.STUDENTS_VIEW),
  StudentController.getStudentStats
);

router.post(
  '/',
  requirePermission(PERMISSIONS.STUDENTS_CREATE),
  validateRequest({ body: createStudentSchema }),
  StudentController.createStudent
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.STUDENTS_VIEW),
  StudentController.getStudentById
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.STUDENTS_UPDATE),
  validateRequest({ body: updateStudentSchema }),
  StudentController.updateStudent
);

router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.STUDENTS_UPDATE),
  validateRequest({ body: updateStudentStatusSchema }),
  StudentController.updateStudentStatus
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.STUDENTS_DELETE),
  StudentController.deleteStudent
);

export const studentRoutes = router;
