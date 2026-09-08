import { Student } from '../students/student.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { Invoice } from '../fees/invoice.model.js';
import { FeePayment } from '../fees/feePayment.model.js';
import { Mark } from '../exams/mark.model.js';
import { Bus, TransportAssignment } from '../transport/transport.model.js';
import { Class } from '../academics/class.model.js';

export class ReportsService {
  // ==========================================
  // EXECUTIVE SUMMARY
  // ==========================================
  static async getExecutiveSummary(schoolId: string) {
    const [totalStudents, activeBuses, classes] = await Promise.all([
      Student.countDocuments({ schoolId, status: 'ACTIVE' }),
      Bus.countDocuments({ schoolId, status: 'ACTIVE' }),
      Class.find({ schoolId }).lean(),
    ]);

    // Financial totals
    const invoices = await Invoice.find({ schoolId }).select('totalAmount paidAmount status').lean();
    const totalBilled = invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0);
    const totalOutstanding = totalBilled - totalCollected;

    // Recent Attendance Rate
    const recentAttendance = await Attendance.find({ schoolId })
      .sort({ date: -1 })
      .limit(200)
      .lean();

    const presentCount = recentAttendance.filter((a: any) => a.status === 'PRESENT').length;
    const attendanceRate =
      recentAttendance.length > 0
        ? Math.round((presentCount / recentAttendance.length) * 100)
        : 95;

    return {
      totalStudents,
      totalClasses: classes.length,
      activeBuses,
      finance: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100,
      },
      attendanceRate,
    };
  }

  // ==========================================
  // STUDENT ENROLLMENT REPORT
  // ==========================================
  static async getStudentReport(schoolId: string) {
    const students = await Student.find({ schoolId })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ admissionNumber: 1 })
      .lean();

    // Group by class
    const byClass: Record<string, number> = {};
    const byGender: Record<string, number> = { Male: 0, Female: 0, Other: 0 };

    students.forEach((s) => {
      const className = (s.classId as any)?.name || 'Unassigned';
      byClass[className] = (byClass[className] || 0) + 1;

      const gender = s.gender || 'Other';
      byGender[gender] = (byGender[gender] || 0) + 1;
    });

    return {
      total: students.length,
      byClass,
      byGender,
      students: students.map((s) => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        className: (s.classId as any)?.name || 'N/A',
        sectionName: (s.sectionId as any)?.name || 'N/A',
        gender: s.gender,
        status: s.status,
      })),
    };
  }

  // ==========================================
  // ATTENDANCE REPORT
  // ==========================================
  static async getAttendanceReport(schoolId: string, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const records = await Attendance.find({
      schoolId,
      date: { $gte: cutoff.toISOString().split('T')[0] },
    })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .sort({ date: -1 })
      .lean();

    const statusCounts: Record<string, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };

    records.forEach((r: any) => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      }
    });

    const total = records.length;
    const attendancePercentage =
      total > 0 ? Math.round((statusCounts.PRESENT / total) * 100) : 0;

    return {
      periodDays: days,
      totalRecords: total,
      statusCounts,
      attendancePercentage,
      recentRecords: records.slice(0, 50).map((r: any) => ({
        id: r._id,
        date: r.date,
        studentName: r.studentId
          ? `${(r.studentId as any).firstName} ${(r.studentId as any).lastName}`
          : 'Unknown',
        className: (r.classId as any)?.name || 'N/A',
        status: r.status,
      })),
    };
  }

  // ==========================================
  // FEE & COLLECTION REPORT
  // ==========================================
  static async getFeeReport(schoolId: string) {
    const invoices = await Invoice.find({ schoolId })
      .populate('studentId', 'firstName lastName admissionNumber')
      .sort({ createdAt: -1 })
      .lean();

    const payments = await FeePayment.find({ schoolId }).sort({ date: -1 }).lean();

    let totalInvoiced = 0;
    let totalCollected = 0;
    const statusBreakdown: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      totalInvoiced += inv.totalAmount || 0;
      totalCollected += inv.paidAmount || 0;
      statusBreakdown[inv.status] = (statusBreakdown[inv.status] || 0) + 1;
    });

    const totalOutstanding = totalInvoiced - totalCollected;

    return {
      totalInvoices: invoices.length,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      collectionPercentage:
        totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100,
      statusBreakdown,
      recentPayments: payments.slice(0, 30).map((p: any) => ({
        id: p._id,
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.date,
      })),
    };
  }

  // ==========================================
  // EXAM & PERFORMANCE REPORT
  // ==========================================
  static async getExamReport(schoolId: string) {
    const marks = await Mark.find({ schoolId })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('examId', 'name academicYear')
      .populate('subjectId', 'name code')
      .lean();

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    marks.forEach((m: any) => {
      totalMarksObtained += m.marksObtained || 0;
      totalMaxMarks += m.maxMarks || 100;
    });

    const overallAverage =
      totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    return {
      totalEvaluations: marks.length,
      overallAverage,
      evaluations: marks.slice(0, 50).map((m: any) => ({
        id: m._id,
        studentName: m.studentId
          ? `${(m.studentId as any).firstName} ${(m.studentId as any).lastName}`
          : 'Unknown',
        examName: (m.examId as any)?.name || 'Exam',
        subjectName: (m.subjectId as any)?.name || 'Subject',
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade || 'N/A',
      })),
    };
  }

  // ==========================================
  // TRANSPORT FLEET REPORT
  // ==========================================
  static async getTransportReport(schoolId: string) {
    const [buses, assignments] = await Promise.all([
      Bus.find({ schoolId }).populate('driverId', 'name phone').lean(),
      TransportAssignment.find({ schoolId }).lean(),
    ]);

    const totalCapacity = buses.reduce((acc: number, b: any) => acc + (b.capacity || 0), 0);
    const assignedSeats = assignments.length;
    const utilizationRate =
      totalCapacity > 0 ? Math.round((assignedSeats / totalCapacity) * 100) : 0;

    return {
      totalBuses: buses.length,
      activeBuses: buses.filter((b) => b.status === 'ACTIVE').length,
      totalCapacity,
      assignedSeats,
      utilizationRate,
      fleet: buses.map((b) => ({
        id: b._id,
        busNumber: b.busNumber,
        registrationNumber: b.registrationNumber,
        capacity: b.capacity,
        status: b.status,
        driverName: (b.driverId as any)?.name || 'Unassigned',
      })),
    };
  }
}
