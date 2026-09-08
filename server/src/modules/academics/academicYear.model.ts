import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAcademicYear extends Document {
  schoolId: Types.ObjectId;
  name: string; // e.g. "2026-2027"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', academicYearSchema);
