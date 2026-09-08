import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export interface IFeePayment extends Document {
  schoolId: Types.ObjectId;
  receiptNumber: string;
  invoiceId: Types.ObjectId;
  studentId: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  receivedBy?: Types.ObjectId | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feePaymentSchema = new Schema<IFeePayment>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'],
      required: true,
      default: 'CASH',
    },
    transactionReference: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

feePaymentSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });
feePaymentSchema.index({ schoolId: 1, invoiceId: 1 });
feePaymentSchema.index({ schoolId: 1, date: -1 });

export const FeePayment = mongoose.model<IFeePayment>('FeePayment', feePaymentSchema);
