import { Request, Response, NextFunction } from 'express';
import { HomeworkService } from './homework.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class HomeworkController {
  static async listHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await HomeworkService.listHomework(req.schoolId!, req.query as any);
      return ApiResponse.success(res, items, 'Homework assignments retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const hw = await HomeworkService.createHomework(req.schoolId!, req.body, req.user?.userId);
      return ApiResponse.success(res, hw, 'Homework created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getHomeworkDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const hw = await HomeworkService.getHomeworkDetails(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, hw, 'Homework details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteHomework(req: Request, res: Response, next: NextFunction) {
    try {
      await HomeworkService.deleteHomework(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Homework deleted');
    } catch (error) {
      next(error);
    }
  }
}
