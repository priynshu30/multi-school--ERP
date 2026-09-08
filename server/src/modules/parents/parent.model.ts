import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IParent extends Document {
  schoolId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  occupation?: string;
  relation: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  photo?: string;
  children: Types.ObjectId[]; // array of Student IDs
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
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
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    address: { type: String, trim: true },
    occupation: { type: String, trim: true },
    relation: {
      type: String,
      enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'],
      default: 'GUARDIAN',
    },
    photo: { type: String, default: '' },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

// Tenant-scoped unique email (a parent email must be unique within a school)
parentSchema.index({ schoolId: 1, email: 1 }, { unique: true });
parentSchema.index({ schoolId: 1, status: 1 });

export const Parent = mongoose.model<IParent>('Parent', parentSchema);
