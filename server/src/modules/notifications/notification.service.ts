import { Notification, NotificationType } from './notification.model.js';
import { NotFoundError } from '../../utils/appError.js';

export class NotificationService {
  static async getUserNotifications(userId: string, unreadOnly = false) {
    const filter: any = { userId };
    if (unreadOnly) filter.isRead = false;

    return Notification.find(filter).sort({ createdAt: -1 }).limit(30).lean();
  }

  static async getUnreadCount(userId: string) {
    return Notification.countDocuments({ userId, isRead: false });
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) throw new NotFoundError('Notification not found');

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  }

  static async createNotification(data: {
    userId: string;
    schoolId?: string | null;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    return Notification.create({
      ...data,
      type: data.type || 'SYSTEM',
    });
  }
}
