import { Request, Response, NextFunction } from 'express';
import { ExamService } from './exam.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ExamController {
  // Exams
  static async listExams(req: Request, res: Response, next: NextFunction) {
    try {
      const exams = await ExamService.listExams(req.schoolId!);
      return ApiResponse.success(res, exams, 'Exams retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createExam(req: Request, res: Response, next: NextFunction) {
    try {
      const exam = await ExamService.createExam(req.schoolId!, req.body);
      return ApiResponse.success(res, exam, 'Exam created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateExamStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const exam = await ExamService.updateExamStatus(req.schoolId!, req.params.id as string, req.body.status);
      return ApiResponse.success(res, exam, 'Exam status updated');
    } catch (error) {
      next(error);
    }
  }

  // Schedules
  static async listSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = req.params.examId as string;
      const classId = req.query.classId as string | undefined;
      const schedules = await ExamService.listSchedules(req.schoolId!, examId, classId);
      return ApiResponse.success(res, schedules, 'Schedules retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await ExamService.createSchedule(req.schoolId!, req.body);
      return ApiResponse.success(res, schedule, 'Schedule created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Marks Entry Sheet
  static async getMarksEntrySheet(req: Request, res: Response, next: NextFunction) {
    try {
      const sheet = await ExamService.getMarksEntrySheet(req.schoolId!, req.query as any);
      return ApiResponse.success(res, sheet, 'Marks entry sheet retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async saveBulkMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.saveBulkMarks(req.schoolId!, req.body, req.user?.userId);
      return ApiResponse.success(res, result, 'Marks saved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Report Card
  static async getStudentReportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = req.params.examId as string;
      const studentId = req.params.studentId as string;
      const report = await ExamService.getStudentReportCard(req.schoolId!, examId, studentId);
      return ApiResponse.success(res, report, 'Report card retrieved');
    } catch (error) {
      next(error);
    }
  }
}
