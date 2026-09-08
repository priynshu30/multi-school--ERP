import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClass extends Document {
  schoolId: Types.ObjectId;
  name: string; // e.g. "Class 5" or "Grade 5"
  order: number; // for sorting (1 = lowest class)
  academicYearId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    academicYearId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      default: null,
    },
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, name: 1 }, { unique: true });
classSchema.index({ schoolId: 1, order: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);
