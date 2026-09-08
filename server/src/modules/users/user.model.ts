import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '../../constants/roles.js';

export interface IUser extends Document {
  schoolId?: Types.ObjectId | null;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  phone?: string;
  avatar?: string;
  emailVerified?: boolean;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.STAFF,
    },
    permissions: [{ type: String }],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound indexes for multi-tenant isolation and fast lookup
userSchema.index({ schoolId: 1, email: 1 }, { unique: true });
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ email: 1 });

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
