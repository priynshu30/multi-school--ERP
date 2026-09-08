import { z } from 'zod';

export const createExamSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  term: z.string().min(1, 'Term is required').trim(),
  academicYear: z.string().min(1, 'Academic year is required').trim(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  classes: z.array(z.string()).optional(),
});

export const createExamScheduleSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  maxMarks: z.number().default(100),
  passMarks: z.number().default(35),
  room: z.string().optional(),
});

export const saveBulkMarksSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional().nullable(),
  subjectId: z.string().min(1, 'Subject ID is required'),
  maxMarks: z.number().default(100),
  marks: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      marksObtained: z.number().min(0),
      remarks: z.string().optional(),
    })
  ),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>;
export type SaveBulkMarksInput = z.infer<typeof saveBulkMarksSchema>;
