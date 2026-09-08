import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  bulkStudentAttendanceSchema,
  bulkStaffAttendanceSchema,
  biometricPunchSchema,
} from './attendance.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Student roll call
router.get(
  '/sheet',
  requirePermission(PERMISSIONS.ATTENDANCE_VIEW),
  AttendanceController.getClassAttendanceSheet
);

router.post(
  '/bulk',
  requirePermission(PERMISSIONS.ATTENDANCE_MARK),
  validateRequest({ body: bulkStudentAttendanceSchema }),
  AttendanceController.markBulkStudentAttendance
);

// Staff attendance
router.get(
  '/staff-sheet',
  requirePermission(PERMISSIONS.ATTENDANCE_VIEW),
  AttendanceController.getStaffAttendanceSheet
);

router.post(
  '/staff-bulk',
  requirePermission(PERMISSIONS.ATTENDANCE_MARK),
  validateRequest({ body: bulkStaffAttendanceSchema }),
  AttendanceController.markBulkStaffAttendance
);

// Reports / summary
router.get(
  '/summary',
  requirePermission(PERMISSIONS.ATTENDANCE_VIEW),
  AttendanceController.getMonthlyAttendanceSummary
);

// Biometric device integration
router.post(
  '/biometric/webhook',
  validateRequest({ body: biometricPunchSchema }),
  AttendanceController.ingestBiometricPunch
);

router.get(
  '/biometric/logs',
  requirePermission(PERMISSIONS.ATTENDANCE_VIEW),
  AttendanceController.listBiometricLogs
);

export const attendanceRoutes = router;
