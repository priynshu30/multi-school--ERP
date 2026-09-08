import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/summary', ReportsController.getExecutiveSummary);
router.get('/students', ReportsController.getStudentReport);
router.get('/attendance', ReportsController.getAttendanceReport);
router.get('/fees', ReportsController.getFeeReport);
router.get('/exams', ReportsController.getExamReport);
router.get('/transport', ReportsController.getTransportReport);

export const reportsRoutes = router;
