import mongoose, { Document, Schema } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  code: string;
  slug: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  academicYear?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'ARCHIVED';
  planId?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    academicYear: { type: String, default: '2026-2027' },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    planId: { type: String, default: 'standard' },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

schoolSchema.index({ status: 1 });

export const School = mongoose.model<ISchool>('School', schoolSchema);
