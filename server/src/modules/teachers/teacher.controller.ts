import { Request, Response, NextFunction } from 'express';
import { TeacherService } from './teacher.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class TeacherController {
  static async createTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const teacher = await TeacherService.createTeacher(schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, teacher, 'Teacher created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await TeacherService.listTeachers(schoolId, req.query as any);
      return ApiResponse.paginated(
        res,
        result.teachers,
        result.pagination,
        'Teachers retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTeacherById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      const teacher = await TeacherService.getTeacherById(id, schoolId);
      return ApiResponse.success(res, teacher, 'Teacher details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const teacher = await TeacherService.updateTeacher(id, schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, teacher, 'Teacher updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      await TeacherService.deleteTeacher(id, schoolId, req.user?.userId);
      return ApiResponse.success(res, null, 'Teacher deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
