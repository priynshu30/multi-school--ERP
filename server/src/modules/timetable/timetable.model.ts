import mongoose, { Document, Schema, Types } from 'mongoose';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface ITimetableSlot extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId?: Types.ObjectId | null;
  dayOfWeek: DayOfWeek;
  periodNumber: number; // 1 through 8
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "09:45 AM"
  subjectId: Types.ObjectId;
  teacherId?: Types.ObjectId | null;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSlotSchema = new Schema<ITimetableSlot>(
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
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    dayOfWeek: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
      index: true,
    },
    room: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Class slot uniqueness
timetableSlotSchema.index(
  { schoolId: 1, classId: 1, sectionId: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true }
);

export const TimetableSlot = mongoose.model<ITimetableSlot>('TimetableSlot', timetableSlotSchema);
