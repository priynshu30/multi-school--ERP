import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
export type AttendanceTarget = 'STUDENT' | 'STAFF';
export type AttendanceSource = 'MANUAL' | 'BIOMETRIC';

export interface IAttendance extends Document {
  schoolId: Types.ObjectId;
  targetType: AttendanceTarget;
  studentId?: Types.ObjectId | null;
  staffId?: Types.ObjectId | null;
  classId?: Types.ObjectId | null;
  sectionId?: Types.ObjectId | null;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  source: AttendanceSource;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  markedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['STUDENT', 'STAFF'],
      required: true,
      default: 'STUDENT',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },
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
    date: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
      required: true,
      default: 'PRESENT',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['MANUAL', 'BIOMETRIC'],
      default: 'MANUAL',
    },
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique indexes ensuring one attendance entry per student/staff per date within a school
attendanceSchema.index(
  { schoolId: 1, targetType: 1, studentId: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { studentId: { $ne: null } },
  }
);

attendanceSchema.index(
  { schoolId: 1, targetType: 1, staffId: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: { staffId: { $ne: null } },
  }
);

attendanceSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, date: 1, status: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
