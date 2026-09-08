import { Exam } from './exam.model.js';
import { ExamSchedule } from './examSchedule.model.js';
import { Mark } from './mark.model.js';
import { Student } from '../students/student.model.js';
import { Subject } from '../academics/subject.model.js';
import { NotFoundError, BadRequestError } from '../../utils/appError.js';
import mongoose from 'mongoose';

export class ExamService {
  // Compute standard letter grade
  static computeGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 35) return 'E';
    return 'F';
  }

  // ================= 1. Exams =================
  static async listExams(schoolId: string) {
    return Exam.find({ schoolId })
      .populate('classes', 'name order')
      .sort({ startDate: -1 })
      .lean();
  }

  static async createExam(schoolId: string, data: any) {
    return Exam.create({
      ...data,
      schoolId,
    });
  }

  static async updateExamStatus(schoolId: string, examId: string, status: string) {
    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) throw new NotFoundError('Exam not found');
    exam.status = status as any;
    await exam.save();
    return exam;
  }

  // ================= 2. Schedules =================
  static async listSchedules(schoolId: string, examId: string, classId?: string) {
    const filter: any = { schoolId, examId };
    if (classId) filter.classId = classId;

    return ExamSchedule.find(filter)
      .populate('classId', 'name')
      .populate('subjectId', 'name code')
      .sort({ examDate: 1, startTime: 1 })
      .lean();
  }

  static async createSchedule(schoolId: string, data: any) {
    return ExamSchedule.create({
      ...data,
      schoolId,
    });
  }

  // ================= 3. Marks Entry Sheet =================
  static async getMarksEntrySheet(
    schoolId: string,
    params: { examId: string; classId: string; sectionId?: string; subjectId: string }
  ) {
    const { examId, classId, sectionId, subjectId } = params;

    const studentFilter: any = { schoolId, classId, status: 'ACTIVE' };
    if (sectionId) studentFilter.sectionId = sectionId;

    const students = await Student.find(studentFilter)
      .select('firstName lastName admissionNumber rollNumber photo')
      .sort({ rollNumber: 1, firstName: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // Fetch existing mark records
    const existingMarks = await Mark.find({
      schoolId,
      examId,
      subjectId,
      studentId: { $in: studentIds },
    }).lean();

    const markMap = new Map(existingMarks.map((m) => [m.studentId.toString(), m]));

    return students.map((s) => {
      const record = markMap.get(s._id.toString());
      return {
        student: s,
        marksObtained: record ? record.marksObtained : '',
        grade: record ? record.grade : '',
        remarks: record ? record.remarks : '',
        maxMarks: record ? record.maxMarks : 100,
        isRecorded: !!record,
      };
    });
  }

  // ================= 4. Save Bulk Marks =================
  static async saveBulkMarks(
    schoolId: string,
    data: {
      examId: string;
      classId: string;
      sectionId?: string;
      subjectId: string;
      maxMarks?: number;
      marks: Array<{ studentId: string; marksObtained: number; remarks?: string }>;
    },
    enteredBy?: string
  ) {
    const { examId, classId, sectionId, subjectId, marks } = data;
    const maxMarks = data.maxMarks || 100;

    const operations = marks.map((m) => {
      const percentage = (Number(m.marksObtained) / maxMarks) * 100;
      const grade = ExamService.computeGrade(percentage);

      return {
        updateOne: {
          filter: {
            schoolId: new mongoose.Types.ObjectId(schoolId),
            examId: new mongoose.Types.ObjectId(examId),
            studentId: new mongoose.Types.ObjectId(m.studentId),
            subjectId: new mongoose.Types.ObjectId(subjectId),
          },
          update: {
            $set: {
              classId: new mongoose.Types.ObjectId(classId),
              sectionId: sectionId ? new mongoose.Types.ObjectId(sectionId) : null,
              marksObtained: Number(m.marksObtained),
              maxMarks,
              grade,
              remarks: m.remarks || '',
              enteredBy: enteredBy ? new mongoose.Types.ObjectId(enteredBy) : null,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Mark.bulkWrite(operations);
    return {
      savedCount: marks.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  // ================= 5. Student Report Card =================
  static async getStudentReportCard(schoolId: string, examId: string, studentId: string) {
    const [exam, student, marks] = await Promise.all([
      Exam.findOne({ _id: examId, schoolId }).lean(),
      Student.findOne({ _id: studentId, schoolId })
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .lean(),
      Mark.find({ examId, studentId, schoolId })
        .populate('subjectId', 'name code')
        .lean(),
    ]);

    if (!exam) throw new NotFoundError('Exam session not found');
    if (!student) throw new NotFoundError('Student not found');

    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
    const overallGrade = ExamService.computeGrade(percentage);

    return {
      exam,
      student,
      marks,
      summary: {
        totalSubjects: marks.length,
        totalMaxMarks: totalMax,
        totalMarksObtained: totalObtained,
        percentage,
        overallGrade,
        resultStatus: percentage >= 35 ? 'PASSED' : 'FAILED',
      },
    };
  }
}
