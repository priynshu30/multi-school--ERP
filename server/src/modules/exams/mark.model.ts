import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMark extends Document {
  schoolId: Types.ObjectId;
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId?: Types.ObjectId | null;
  subjectId: Types.ObjectId;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  enteredBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const markSchema = new Schema<IMark>(
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
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
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
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: { type: String, trim: true, default: '' },
    enteredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// One mark record per student per subject per exam
markSchema.index(
  { schoolId: 1, examId: 1, studentId: 1, subjectId: 1 },
  { unique: true }
);

export const Mark = mongoose.model<IMark>('Mark', markSchema);
