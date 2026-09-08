import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'FEE'
  | 'ATTENDANCE'
  | 'EXAM'
  | 'HOMEWORK'
  | 'TRANSPORT'
  | 'NOTICE'
  | 'SYSTEM';

export interface INotification extends Document {
  schoolId?: Types.ObjectId | null;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['FEE', 'ATTENDANCE', 'EXAM', 'HOMEWORK', 'TRANSPORT', 'NOTICE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, trim: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
