import { Student, IStudent } from './student.model.js';
import { Parent } from '../parents/parent.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/appError.js';
import { Types } from 'mongoose';

export class StudentService {
  /**
   * Create a new student record
   */
  static async createStudent(
    schoolId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IStudent> {
    // Check admission number uniqueness within the school
    const existing = await Student.findOne({
      schoolId,
      admissionNumber: data.admissionNumber.toUpperCase(),
    });
    if (existing) {
      throw new ConflictError(
        `Admission number '${data.admissionNumber}' is already registered in this school`,
        'DUPLICATE_ADMISSION_NUMBER'
      );
    }

    const student = await Student.create({
      ...data,
      schoolId,
      admissionNumber: data.admissionNumber.toUpperCase(),
    });

    // If parentId provided, ensure parent exists and link this student
    if (data.parentId) {
      await Parent.findByIdAndUpdate(data.parentId, {
        $addToSet: { children: student._id },
      });
    }

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STUDENT_CREATED',
        resource: 'students',
        resourceId: student._id.toString(),
        after: { name: `${student.firstName} ${student.lastName}`, admissionNumber: student.admissionNumber },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return student;
  }

  /**
   * List students with search, filter, pagination
   */
  static async listStudents(
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      classId?: string;
      sectionId?: string;
      parentId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { schoolId };

    if (params.status) filter.status = params.status;
    if (params.classId) filter.classId = params.classId;
    if (params.sectionId) filter.sectionId = params.sectionId;
    if (params.parentId) filter.parentId = params.parentId;

    if (params.search) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { admissionNumber: regex },
        { rollNumber: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('classId', 'name order')
        .populate('sectionId', 'name')
        .populate('parentId', 'firstName lastName email phone relation')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single student by ID (scoped to school)
   */
  static async getStudentById(schoolId: string, studentId: string): Promise<IStudent> {
    const student = await Student.findOne({ _id: studentId, schoolId })
      .populate('classId', 'name order')
      .populate('sectionId', 'name')
      .populate('parentId', 'firstName lastName email phone relation photo')
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    return student as unknown as IStudent;
  }

  /**
   * Update student details
   */
  static async updateStudent(
    schoolId: string,
    studentId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IStudent> {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    // If changing admission number, check uniqueness
    if (
      data.admissionNumber &&
      data.admissionNumber.toUpperCase() !== student.admissionNumber
    ) {
      const dup = await Student.findOne({
        schoolId,
        admissionNumber: data.admissionNumber.toUpperCase(),
        _id: { $ne: studentId },
      });
      if (dup) {
        throw new ConflictError(`Admission number '${data.admissionNumber}' is already in use`, 'DUPLICATE_ADMISSION_NUMBER');
      }
    }

    const before = student.toObject();

    // Handle parent linking change
    if (data.parentId !== undefined) {
      const oldParentId = student.parentId?.toString();
      const newParentId = data.parentId ? data.parentId.toString() : null;

      if (oldParentId && oldParentId !== newParentId) {
        // Unlink from old parent
        await Parent.findByIdAndUpdate(oldParentId, {
          $pull: { children: student._id },
        });
      }
      if (newParentId && newParentId !== oldParentId) {
        // Link to new parent
        await Parent.findByIdAndUpdate(newParentId, {
          $addToSet: { children: student._id },
        });
      }
    }

    if (data.admissionNumber) data.admissionNumber = data.admissionNumber.toUpperCase();
    Object.assign(student, data);
    await student.save();

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STUDENT_UPDATED',
        resource: 'students',
        resourceId: student._id.toString(),
        before,
        after: student.toObject(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return student;
  }

  /**
   * Update student status
   */
  static async updateStudentStatus(
    schoolId: string,
    studentId: string,
    status: IStudent['status'],
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IStudent> {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    const before = { status: student.status };
    student.status = status;
    await student.save();

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STUDENT_STATUS_CHANGED',
        resource: 'students',
        resourceId: student._id.toString(),
        before,
        after: { status },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return student;
  }

  /**
   * Delete a student record
   */
  static async deleteStudent(
    schoolId: string,
    studentId: string,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    // Unlink from parent if linked
    if (student.parentId) {
      await Parent.findByIdAndUpdate(student.parentId, {
        $pull: { children: student._id },
      });
    }

    await student.deleteOne();

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STUDENT_DELETED',
        resource: 'students',
        resourceId: studentId,
        before: { name: `${student.firstName} ${student.lastName}`, admissionNumber: student.admissionNumber },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }
  }

  /**
   * School-level student statistics
   */
  static async getStudentStats(schoolId: string) {
    const [total, active, inactive, alumni, transferred] = await Promise.all([
      Student.countDocuments({ schoolId }),
      Student.countDocuments({ schoolId, status: 'ACTIVE' }),
      Student.countDocuments({ schoolId, status: 'INACTIVE' }),
      Student.countDocuments({ schoolId, status: 'ALUMNI' }),
      Student.countDocuments({ schoolId, status: 'TRANSFERRED' }),
    ]);

    return { total, active, inactive, alumni, transferred };
  }
}
