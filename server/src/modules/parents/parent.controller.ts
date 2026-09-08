import { Request, Response, NextFunction } from 'express';
import { ParentService } from './parent.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ParentController {
  static async createParent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const parent = await ParentService.createParent(schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, parent, 'Parent created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listParents(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await ParentService.listParents(schoolId, req.query as any);
      return ApiResponse.paginated(res, result.parents, result.pagination, 'Parents retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getParentById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const parent = await ParentService.getParentById(schoolId, req.params.id as string);
      return ApiResponse.success(res, parent, 'Parent details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateParent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const parent = await ParentService.updateParent(schoolId, req.params.id as string, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, parent, 'Parent updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async linkChild(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const parent = await ParentService.linkChild(schoolId, req.params.id as string, req.body.studentId);
      return ApiResponse.success(res, parent, 'Child linked successfully');
    } catch (error) {
      next(error);
    }
  }

  static async unlinkChild(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const parent = await ParentService.unlinkChild(schoolId, req.params.id as string, req.params.studentId as string);
      return ApiResponse.success(res, parent, 'Child unlinked successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteParent(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      await ParentService.deleteParent(schoolId, req.params.id as string, req.user?.userId, meta);
      return ApiResponse.success(res, null, 'Parent deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
