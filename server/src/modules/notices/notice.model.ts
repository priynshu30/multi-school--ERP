import mongoose, { Document, Schema, Types } from 'mongoose';

export type NoticeAudience = 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface INotice extends Document {
  schoolId: Types.ObjectId;
  title: string;
  content: string;
  audience: NoticeAudience;
  priority: NoticePriority;
  startDate: Date;
  endDate?: Date | null;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS'],
      default: 'ALL',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    authorName: { type: String, default: 'School Administration' },
  },
  { timestamps: true }
);

noticeSchema.index({ schoolId: 1, startDate: -1 });

export const Notice = mongoose.model<INotice>('Notice', noticeSchema);
