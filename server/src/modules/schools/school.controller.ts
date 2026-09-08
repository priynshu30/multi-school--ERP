import { Request, Response, NextFunction } from 'express';
import { SchoolService } from './school.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { NotFoundError } from '../../utils/appError.js';

export class SchoolController {
  static async createSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const result = await SchoolService.createSchoolWithAdmin(req.body, req.user?.userId, meta);
      return ApiResponse.success(res, result, 'School created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listSchools(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SchoolService.listSchools(req.query as any);
      return ApiResponse.paginated(
        res,
        result.schools,
        result.pagination,
        'Schools retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        throw new NotFoundError('No active school context');
      }
      const school = await SchoolService.getSchoolDetails(schoolId);
      return ApiResponse.success(res, school, 'Current school retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getSchoolById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const school = await SchoolService.getSchoolDetails(id);
      return ApiResponse.success(res, school, 'School details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const school = await SchoolService.updateSchool(id, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, school, 'School updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async activateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const school = await SchoolService.setSchoolStatus(id, 'ACTIVE', req.user?.userId);
      return ApiResponse.success(res, school, 'School activated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async suspendSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const school = await SchoolService.setSchoolStatus(id, 'SUSPENDED', req.user?.userId);
      return ApiResponse.success(res, school, 'School suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  static async archiveSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const school = await SchoolService.setSchoolStatus(id, 'ARCHIVED', req.user?.userId);
      return ApiResponse.success(res, school, 'School archived successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPlatformStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SchoolService.getPlatformStats();
      return ApiResponse.success(res, stats, 'Platform statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentSchoolStats(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        throw new NotFoundError('No active school context');
      }
      const stats = await SchoolService.getSchoolStats(schoolId);
      return ApiResponse.success(res, stats, 'School statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrentSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId;
      if (!schoolId) {
        throw new NotFoundError('No active school context');
      }
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const updated = await SchoolService.updateSchool(schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, updated, 'School settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
