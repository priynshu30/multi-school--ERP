import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISection extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  name: string; // e.g. "A", "B", "C"
  classTeacherId?: Types.ObjectId | null;
  capacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
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
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, uppercase: true },
    classTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    capacity: { type: Number, default: 40 },
  },
  { timestamps: true }
);

// Section name must be unique within a class
sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model<ISection>('Section', sectionSchema);
