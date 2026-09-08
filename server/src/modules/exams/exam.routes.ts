import { Router } from 'express';
import { ExamController } from './exam.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createExamSchema,
  createExamScheduleSchema,
  saveBulkMarksSchema,
} from './exam.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Exams
router.get(
  '/',
  requirePermission(PERMISSIONS.EXAMS_VIEW),
  ExamController.listExams
);

router.post(
  '/',
  requirePermission(PERMISSIONS.EXAMS_MANAGE),
  validateRequest({ body: createExamSchema }),
  ExamController.createExam
);

router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.EXAMS_MANAGE),
  ExamController.updateExamStatus
);

// Schedules
router.get(
  '/:examId/schedules',
  requirePermission(PERMISSIONS.EXAMS_VIEW),
  ExamController.listSchedules
);

router.post(
  '/schedules',
  requirePermission(PERMISSIONS.EXAMS_MANAGE),
  validateRequest({ body: createExamScheduleSchema }),
  ExamController.createSchedule
);

// Marks Entry
router.get(
  '/marks/sheet',
  requirePermission(PERMISSIONS.EXAMS_MARKS_ENTER),
  ExamController.getMarksEntrySheet
);

router.post(
  '/marks/bulk',
  requirePermission(PERMISSIONS.EXAMS_MARKS_ENTER),
  validateRequest({ body: saveBulkMarksSchema }),
  ExamController.saveBulkMarks
);

// Report Cards
router.get(
  '/:examId/report-card/:studentId',
  requirePermission(PERMISSIONS.EXAMS_VIEW),
  ExamController.getStudentReportCard
);

export const examRoutes = router;
