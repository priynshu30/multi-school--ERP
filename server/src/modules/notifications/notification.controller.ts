import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await NotificationService.getUserNotifications(
        req.user?.userId!,
        unreadOnly
      );
      return ApiResponse.success(res, notifications, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await NotificationService.getUnreadCount(req.user?.userId!);
      return ApiResponse.success(res, { count }, 'Unread count retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await NotificationService.markAsRead(req.user?.userId!, req.params.id as string);
      return ApiResponse.success(res, updated, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user?.userId!);
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}
