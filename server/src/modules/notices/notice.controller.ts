import { Request, Response, NextFunction } from 'express';
import { NoticeService } from './notice.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class NoticeController {
  static async listNotices(req: Request, res: Response, next: NextFunction) {
    try {
      const audience = req.query.audience as string | undefined;
      const notices = await NoticeService.listNotices(req.schoolId!, audience);
      return ApiResponse.success(res, notices, 'Notices retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await NoticeService.createNotice(req.schoolId!, req.body, req.user?.email);
      return ApiResponse.success(res, notice, 'Notice published successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotice(req: Request, res: Response, next: NextFunction) {
    try {
      await NoticeService.deleteNotice(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Notice deleted');
    } catch (error) {
      next(error);
    }
  }
}
