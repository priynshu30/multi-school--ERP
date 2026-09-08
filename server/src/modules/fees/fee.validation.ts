import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  academicYear: z.string().min(1, 'Academic year is required').trim(),
  classId: z.string().optional().nullable(),
  components: z
    .array(
      z.object({
        name: z.string().min(1, 'Component name required').trim(),
        amount: z.number().min(0, 'Amount must be positive'),
        frequency: z.enum(['MONTHLY', 'TERMLY', 'ANNUAL', 'ONE_TIME']).default('TERMLY'),
      })
    )
    .min(1, 'At least one fee component required'),
});

export const generateClassInvoicesSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  feeStructureId: z.string().min(1, 'Fee Structure ID is required'),
  title: z.string().min(1, 'Invoice title is required').trim(),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const collectPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().min(1, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE']).default('CASH'),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type GenerateClassInvoicesInput = z.infer<typeof generateClassInvoicesSchema>;
export type CollectPaymentInput = z.infer<typeof collectPaymentSchema>;
