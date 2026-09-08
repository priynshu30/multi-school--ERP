import { Request, Response, NextFunction } from 'express';
import { StaffService } from './staff.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class StaffController {
  static async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const staff = await StaffService.createStaff(schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, staff, 'Staff member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await StaffService.listStaff(schoolId, req.query as any);
      return ApiResponse.paginated(
        res,
        result.staff,
        result.pagination,
        'Staff members retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStaffById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      const staff = await StaffService.getStaffById(id, schoolId);
      return ApiResponse.success(res, staff, 'Staff details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const staff = await StaffService.updateStaff(id, schoolId, req.body, req.user?.userId, meta);
      return ApiResponse.success(res, staff, 'Staff member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const id = String(req.params.id);
      await StaffService.deleteStaff(id, schoolId, req.user?.userId);
      return ApiResponse.success(res, null, 'Staff member deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
