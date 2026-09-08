import { z } from 'zod';

export const createStudentSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required').trim(),
  rollNumber: z.string().trim().optional(),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().trim().optional(),
  photo: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  academicYear: z.string().trim().optional(),
  parentId: z.string().optional(),
  transportAssigned: z.boolean().optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      relation: z.string().trim().optional(),
    })
    .optional(),
  notes: z.string().trim().optional(),
});

export const updateStudentSchema = z.object({
  admissionNumber: z.string().min(1).trim().optional(),
  rollNumber: z.string().trim().optional(),
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().trim().optional(),
  photo: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  classId: z.string().optional().nullable(),
  sectionId: z.string().optional().nullable(),
  academicYear: z.string().trim().optional(),
  parentId: z.string().optional().nullable(),
  transportAssigned: z.boolean().optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      relation: z.string().trim().optional(),
    })
    .optional(),
  notes: z.string().trim().optional(),
});

export const updateStudentStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI', 'TRANSFERRED']),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
