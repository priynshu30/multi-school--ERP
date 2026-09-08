import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeacher extends Document {
  schoolId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  qualification: string;
  specialization: string;
  joiningDate?: Date;
  phone?: string;
  email: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

// Compound unique index: employeeId is unique within each school
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, status: 1 });
teacherSchema.index({ schoolId: 1, email: 1 });

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);
