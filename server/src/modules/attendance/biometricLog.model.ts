import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBiometricLog extends Document {
  schoolId: Types.ObjectId;
  deviceId: string;
  identifier: string; // employeeId or admissionNumber
  eventType: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: Date;
  rawEventId: string; // idempotency key
  processed: boolean;
  mappedTargetType?: 'STUDENT' | 'STAFF' | null;
  mappedEntityId?: Types.ObjectId | null;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const biometricLogSchema = new Schema<IBiometricLog>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    deviceId: { type: String, required: true, trim: true },
    identifier: { type: String, required: true, trim: true, uppercase: true },
    eventType: {
      type: String,
      enum: ['CHECK_IN', 'CHECK_OUT'],
      required: true,
      default: 'CHECK_IN',
    },
    timestamp: { type: Date, required: true, default: Date.now },
    rawEventId: { type: String, required: true, trim: true },
    processed: { type: Boolean, default: false },
    mappedTargetType: { type: String, enum: ['STUDENT', 'STAFF', null], default: null },
    mappedEntityId: { type: Schema.Types.ObjectId, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

// Idempotency: Duplicate rawEventId rejected per school
biometricLogSchema.index({ schoolId: 1, rawEventId: 1 }, { unique: true });
biometricLogSchema.index({ schoolId: 1, timestamp: -1 });

export const BiometricLog = mongoose.model<IBiometricLog>('BiometricLog', biometricLogSchema);
