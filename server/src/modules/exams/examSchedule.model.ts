import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExamSchedule extends Document {
  schoolId: Types.ObjectId;
  examId: Types.ObjectId;
  classId: Types.ObjectId;
  subjectId: Types.ObjectId;
  examDate: Date;
  startTime: string; // e.g. "09:30 AM"
  endTime: string; // e.g. "12:30 PM"
  maxMarks: number;
  passMarks: number;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examScheduleSchema = new Schema<IExamSchedule>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    maxMarks: { type: Number, required: true, default: 100 },
    passMarks: { type: Number, required: true, default: 35 },
    room: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

examScheduleSchema.index(
  { schoolId: 1, examId: 1, classId: 1, subjectId: 1 },
  { unique: true }
);

export const ExamSchedule = mongoose.model<IExamSchedule>('ExamSchedule', examScheduleSchema);
