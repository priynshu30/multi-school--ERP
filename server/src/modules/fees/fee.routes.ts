import { Router } from 'express';
import { FeeController } from './fee.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createFeeStructureSchema,
  generateClassInvoicesSchema,
  collectPaymentSchema,
} from './fee.validation.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Fee structures
router.get(
  '/structures',
  requirePermission(PERMISSIONS.FEES_VIEW),
  FeeController.listFeeStructures
);

router.post(
  '/structures',
  requirePermission(PERMISSIONS.FEES_CREATE),
  validateRequest({ body: createFeeStructureSchema }),
  FeeController.createFeeStructure
);

// Invoices
router.get(
  '/invoices',
  requirePermission(PERMISSIONS.FEES_VIEW),
  FeeController.listInvoices
);

router.post(
  '/invoices/generate-class',
  requirePermission(PERMISSIONS.FEES_CREATE),
  validateRequest({ body: generateClassInvoicesSchema }),
  FeeController.generateInvoicesForClass
);

router.get(
  '/invoices/:id',
  requirePermission(PERMISSIONS.FEES_VIEW),
  FeeController.getInvoiceDetails
);

// Payments
router.post(
  '/payments/collect',
  requirePermission(PERMISSIONS.FEES_COLLECT),
  validateRequest({ body: collectPaymentSchema }),
  FeeController.collectPayment
);

// Summary / Telemetry
router.get(
  '/summary',
  requirePermission(PERMISSIONS.FEES_VIEW),
  FeeController.getFinancialSummary
);

export const feeRoutes = router;
