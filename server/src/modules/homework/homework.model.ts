import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHomeworkSubmission {
  studentId: Types.ObjectId;
  submittedAt: Date;
  status: 'SUBMITTED' | 'REVIEWED' | 'RESUBMIT';
  attachmentUrl?: string;
  marksObtained?: number;
  remarks?: string;
}

export interface IHomework extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description: string;
  classId: Types.ObjectId;
  sectionId?: Types.ObjectId | null;
  subjectId: Types.ObjectId;
  teacherId?: Types.ObjectId | null;
  dueDate: Date;
  attachments?: string[];
  submissions: IHomeworkSubmission[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSchema = new Schema<IHomework>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    dueDate: { type: Date, required: true },
    attachments: [{ type: String }],
    submissions: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        submittedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['SUBMITTED', 'REVIEWED', 'RESUBMIT'], default: 'SUBMITTED' },
        attachmentUrl: { type: String, default: '' },
        marksObtained: { type: Number },
        remarks: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

homeworkSchema.index({ schoolId: 1, classId: 1, dueDate: -1 });

export const Homework = mongoose.model<IHomework>('Homework', homeworkSchema);
