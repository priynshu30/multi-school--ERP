import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId || null;
      const creatorRole = req.user!.role;
      const user = await UserService.createUser(schoolId, req.body, creatorRole, req.user?.userId);
      return ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId || null;
      const result = await UserService.listUsers(schoolId, req.query as any);
      return ApiResponse.paginated(
        res,
        result.users,
        result.pagination,
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId || null;
      const id = String(req.params.id);
      const user = await UserService.getUserById(id, schoolId);
      return ApiResponse.success(res, user, 'User retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId || null;
      const id = String(req.params.id);
      const user = await UserService.setUserStatus(id, schoolId, 'ACTIVE', req.user!.role, req.user?.userId);
      return ApiResponse.success(res, user, 'User activated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId || null;
      const id = String(req.params.id);
      const user = await UserService.setUserStatus(id, schoolId, 'INACTIVE', req.user!.role, req.user?.userId);
      return ApiResponse.success(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}
