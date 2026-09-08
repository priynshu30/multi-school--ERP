import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubject extends Document {
  schoolId: Types.ObjectId;
  classId?: Types.ObjectId | null;
  name: string;
  code?: string;
  teacherId?: Types.ObjectId | null;
  isOptional: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    isOptional: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
