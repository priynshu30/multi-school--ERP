import { z } from 'zod';

export const createParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone is required').trim(),
  alternatePhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).default('GUARDIAN'),
  photo: z.string().url().optional().or(z.literal('')),
  children: z.array(z.string()).optional(),
});

export const updateParentSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).trim().optional(),
  alternatePhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).optional(),
  photo: z.string().url().optional().or(z.literal('')),
});

export const linkChildSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
});

export type CreateParentInput = z.infer<typeof createParentSchema>;
export type UpdateParentInput = z.infer<typeof updateParentSchema>;
