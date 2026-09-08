import mongoose, { Document, Schema, Types } from 'mongoose';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'TRANSFERRED';

export interface IStudent extends Document {
  schoolId: Types.ObjectId;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  photo?: string;
  email?: string;
  phone?: string;
  address?: string;
  classId?: Types.ObjectId | null;
  sectionId?: Types.ObjectId | null;
  academicYear?: string;
  parentId?: Types.ObjectId | null;
  transportAssigned?: boolean;
  busRouteId?: Types.ObjectId | null;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  documents?: Array<{
    name: string;
    url: string;
    type?: string;
    uploadedAt?: Date;
  }>;
  notes?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    rollNumber: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    bloodGroup: { type: String, trim: true },
    photo: { type: String, default: '' },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
      index: true,
    },
    academicYear: { type: String, trim: true },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      default: null,
      index: true,
    },
    transportAssigned: { type: Boolean, default: false },
    busRouteId: {
      type: Schema.Types.ObjectId,
      ref: 'BusRoute',
      default: null,
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ALUMNI', 'TRANSFERRED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

// Tenant-scoped unique admission number
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });
studentSchema.index({ schoolId: 1, parentId: 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
