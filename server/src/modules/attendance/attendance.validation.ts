import { z } from 'zod';

export const bulkStudentAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  classId: z.string().min(1, 'Class ID required'),
  sectionId: z.string().optional(),
  records: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']),
      remarks: z.string().optional(),
    })
  ),
});

export const bulkStaffAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  records: z.array(
    z.object({
      staffId: z.string().min(1, 'Staff ID required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']),
      remarks: z.string().optional(),
      checkInTime: z.string().optional(),
      checkOutTime: z.string().optional(),
    })
  ),
});

export const biometricPunchSchema = z.object({
  deviceId: z.string().min(1, 'Device ID required'),
  identifier: z.string().min(1, 'Identifier (Roll No / Employee ID) required'),
  eventType: z.enum(['CHECK_IN', 'CHECK_OUT']).default('CHECK_IN'),
  timestamp: z.string().optional(),
  rawEventId: z.string().min(1, 'rawEventId idempotency key required'),
});

export type BulkStudentAttendanceInput = z.infer<typeof bulkStudentAttendanceSchema>;
export type BulkStaffAttendanceInput = z.infer<typeof bulkStaffAttendanceSchema>;
export type BiometricPunchInput = z.infer<typeof biometricPunchSchema>;
