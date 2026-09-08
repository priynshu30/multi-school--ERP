import { Router } from 'express';
import { AcademicsController } from './academics.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Academic Years
router.get('/years', requirePermission(PERMISSIONS.ACADEMICS_VIEW), AcademicsController.listAcademicYears);
router.post('/years', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.createAcademicYear);
router.patch('/years/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.updateAcademicYear);
router.patch('/years/:id/activate', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.setActiveAcademicYear);
router.delete('/years/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.deleteAcademicYear);

// Classes
router.get('/classes', requirePermission(PERMISSIONS.ACADEMICS_VIEW), AcademicsController.listClasses);
router.post('/classes', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.createClass);
router.patch('/classes/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.updateClass);
router.delete('/classes/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.deleteClass);

// Sections
router.get('/sections', requirePermission(PERMISSIONS.ACADEMICS_VIEW), AcademicsController.listSections);
router.post('/sections', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.createSection);
router.patch('/sections/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.updateSection);
router.delete('/sections/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.deleteSection);

// Subjects
router.get('/subjects', requirePermission(PERMISSIONS.ACADEMICS_VIEW), AcademicsController.listSubjects);
router.post('/subjects', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.createSubject);
router.patch('/subjects/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.updateSubject);
router.delete('/subjects/:id', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.deleteSubject);

// Batch Student Promotion
router.post('/promote-students', requirePermission(PERMISSIONS.ACADEMICS_MANAGE), AcademicsController.promoteStudents);

export const academicsRoutes = router;
