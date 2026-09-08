import { FeeStructure } from './feeStructure.model.js';
import { Invoice, InvoiceStatus } from './invoice.model.js';
import { FeePayment, PaymentMethod } from './feePayment.model.js';
import { Student } from '../students/student.model.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/appError.js';
import mongoose from 'mongoose';

export class FeeService {
  // ================= 1. Fee Structures =================
  static async listFeeStructures(schoolId: string) {
    return FeeStructure.find({ schoolId })
      .populate('classId', 'name order')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async createFeeStructure(schoolId: string, data: any) {
    const totalAmount = data.components.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
    return FeeStructure.create({
      ...data,
      schoolId,
      totalAmount,
    });
  }

  // ================= 2. Batch Invoice Generation =================
  static async generateInvoicesForClass(
    schoolId: string,
    data: {
      classId: string;
      feeStructureId: string;
      title: string;
      dueDate: string;
    }
  ) {
    const { classId, feeStructureId, title, dueDate } = data;

    const structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId });
    if (!structure) throw new NotFoundError('Fee structure not found');

    const students = await Student.find({ schoolId, classId, status: 'ACTIVE' });
    if (students.length === 0) {
      throw new BadRequestError('No active students found in selected class');
    }

    const items = structure.components.map((c) => ({
      title: c.name,
      amount: c.amount,
    }));
    const totalAmount = structure.totalAmount;

    // Generate invoices
    const timestamp = Date.now().toString().slice(-4);
    let counter = 1;

    const invoicesToInsert = students.map((s) => {
      const invNo = `INV-${new Date().getFullYear()}-${timestamp}-${String(counter++).padStart(3, '0')}`;
      return {
        schoolId: new mongoose.Types.ObjectId(schoolId),
        invoiceNumber: invNo,
        studentId: s._id,
        classId: new mongoose.Types.ObjectId(classId),
        academicYear: structure.academicYear,
        title,
        dueDate: new Date(dueDate),
        items,
        totalAmount,
        discountAmount: 0,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: 'PENDING' as InvoiceStatus,
      };
    });

    const created = await Invoice.insertMany(invoicesToInsert);
    return {
      generatedCount: created.length,
      totalBilled: created.length * totalAmount,
      dueDate,
    };
  }

  // ================= 3. List Invoices =================
  static async listInvoices(
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      classId?: string;
      status?: string;
      studentId?: string;
      search?: string;
    }
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { schoolId };
    if (params.classId) filter.classId = params.classId;
    if (params.status) filter.status = params.status;
    if (params.studentId) filter.studentId = params.studentId;

    if (params.search) {
      filter.$or = [
        { invoiceNumber: new RegExp(params.search.trim(), 'i') },
        { title: new RegExp(params.search.trim(), 'i') },
      ];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('studentId', 'firstName lastName admissionNumber rollNumber email phone')
        .populate('classId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ================= 4. Get Invoice by ID with Payment History =================
  static async getInvoiceDetails(schoolId: string, id: string) {
    const invoice = await Invoice.findOne({ _id: id, schoolId })
      .populate('studentId', 'firstName lastName admissionNumber rollNumber email phone parentId')
      .populate('classId', 'name')
      .lean();

    if (!invoice) throw new NotFoundError('Invoice not found');

    const payments = await FeePayment.find({ invoiceId: id, schoolId })
      .sort({ date: -1 })
      .lean();

    return {
      ...invoice,
      payments,
    };
  }

  // ================= 5. Collect Payment =================
  static async collectPayment(
    schoolId: string,
    data: {
      invoiceId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      transactionReference?: string;
      notes?: string;
    },
    receivedBy?: string
  ) {
    const invoice = await Invoice.findOne({ _id: data.invoiceId, schoolId });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (invoice.status === 'PAID') {
      throw new BadRequestError('Invoice is already fully paid');
    }
    if (data.amount > invoice.balanceAmount) {
      throw new BadRequestError(`Amount exceeds outstanding balance (₹${invoice.balanceAmount})`);
    }

    // Generate unique receipt number
    const count = await FeePayment.countDocuments({ schoolId });
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const payment = await FeePayment.create({
      schoolId,
      receiptNumber,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference || '',
      notes: data.notes || '',
      receivedBy: receivedBy || null,
      date: new Date(),
    });

    // Recalculate invoice balance
    invoice.paidAmount += data.amount;
    invoice.balanceAmount = invoice.totalAmount - invoice.discountAmount - invoice.paidAmount;

    if (invoice.balanceAmount <= 0) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIAL';
    }
    await invoice.save();

    return {
      payment,
      updatedInvoice: invoice,
    };
  }

  // ================= 6. Financial Summary =================
  static async getFinancialSummary(schoolId: string) {
    const invoices = await Invoice.find({ schoolId, status: { $ne: 'CANCELLED' } }).lean();

    const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);

    const overdueCount = invoices.filter(
      (inv) => inv.status !== 'PAID' && new Date(inv.dueDate) < new Date()
    ).length;

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      overdueCount,
      totalInvoices: invoices.length,
    };
  }
}
