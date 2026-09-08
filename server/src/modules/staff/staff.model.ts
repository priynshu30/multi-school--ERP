import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStaff extends Document {
  schoolId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  photo?: string;
  designation: string;
  department: string;
  joiningDate?: Date;
  phone?: string;
  email: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  documents?: Array<{
    name: string;
    url: string;
    type?: string;
    uploadedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
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
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
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
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index: employeeId is unique within each school
staffSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
staffSchema.index({ schoolId: 1, status: 1 });
staffSchema.index({ schoolId: 1, department: 1 });
staffSchema.index({ schoolId: 1, email: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
