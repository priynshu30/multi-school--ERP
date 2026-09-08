import mongoose, { Document, Schema, Types } from 'mongoose';

export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED';

export interface IExam extends Document {
  schoolId: Types.ObjectId;
  name: string; // e.g. "Mid-Term Examination 2026"
  term: string; // e.g. "Term 1"
  academicYear: string;
  startDate: Date;
  endDate: Date;
  classes: Types.ObjectId[];
  status: ExamStatus;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    term: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'PUBLISHED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

examSchema.index({ schoolId: 1, academicYear: 1, name: 1 });

export const Exam = mongoose.model<IExam>('Exam', examSchema);
