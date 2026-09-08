import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeeComponent {
  name: string;
  amount: number;
  frequency: 'MONTHLY' | 'TERMLY' | 'ANNUAL' | 'ONE_TIME';
}

export interface IFeeStructure extends Document {
  schoolId: Types.ObjectId;
  name: string;
  academicYear: string;
  classId?: Types.ObjectId | null; // null = applies to all classes
  components: IFeeComponent[];
  totalAmount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    components: [
      {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        frequency: {
          type: String,
          enum: ['MONTHLY', 'TERMLY', 'ANNUAL', 'ONE_TIME'],
          default: 'TERMLY',
        },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

feeStructureSchema.index({ schoolId: 1, name: 1, academicYear: 1 });
feeStructureSchema.index({ schoolId: 1, classId: 1 });

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', feeStructureSchema);
