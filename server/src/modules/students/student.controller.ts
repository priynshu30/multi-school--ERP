import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class StudentController {
  static async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const student = await StudentService.createStudent(schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, student, 'Student created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await StudentService.listStudents(schoolId, req.query as any);
      return ApiResponse.paginated(res, result.students, result.pagination, 'Students retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const student = await StudentService.getStudentById(schoolId, req.params.id as string);
      return ApiResponse.success(res, student, 'Student details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const student = await StudentService.updateStudent(schoolId, req.params.id as string, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, student, 'Student updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStudentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const student = await StudentService.updateStudentStatus(schoolId, req.params.id as string, req.body.status, req.user?.userId, meta);
      return ApiResponse.success(res, student, 'Student status updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      await StudentService.deleteStudent(schoolId, req.params.id as string, req.user?.userId, meta);
      return ApiResponse.success(res, null, 'Student deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStudentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const stats = await StudentService.getStudentStats(schoolId);
      return ApiResponse.success(res, stats, 'Student statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
