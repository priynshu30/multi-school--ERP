import bcrypt from 'bcryptjs';
import { Teacher, ITeacher } from './teacher.model.js';
import { User } from '../users/user.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { ConflictError, NotFoundError } from '../../utils/appError.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../../constants/roles.js';

export class TeacherService {
  /**
   * Create new teacher under the specified school tenant
   */
  static async createTeacher(
    schoolId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<ITeacher> {
    const { createAccount, password, ...teacherData } = data;

    // Verify employeeId is unique within this school
    const existingEmp = await Teacher.findOne({
      schoolId,
      employeeId: teacherData.employeeId.toUpperCase(),
    });
    if (existingEmp) {
      throw new ConflictError(
        `Employee ID '${teacherData.employeeId}' is already in use at this school`,
        'DUPLICATE_EMPLOYEE_ID'
      );
    }

    let linkedUserId = null;
    if (createAccount) {
      const existingUser = await User.findOne({ email: teacherData.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError(
          `User with email '${teacherData.email}' already exists`,
          'DUPLICATE_EMAIL'
        );
      }

      const passwordHash = await bcrypt.hash(password || 'Teacher@123', 10);
      const newUser = await User.create({
        schoolId,
        name: `${teacherData.firstName} ${teacherData.lastName}`.trim(),
        email: teacherData.email.toLowerCase(),
        phone: teacherData.phone,
        passwordHash,
        role: ROLES.TEACHER,
        permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER,
        status: teacherData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      });
      linkedUserId = newUser._id;
    }

    const teacher = await Teacher.create({
      ...teacherData,
      schoolId,
      userId: linkedUserId,
      employeeId: teacherData.employeeId.toUpperCase(),
    });

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'TEACHER_CREATED',
        resource: 'teachers',
        resourceId: teacher._id.toString(),
        after: {
          employeeId: teacher.employeeId,
          name: `${teacher.firstName} ${teacher.lastName}`,
          specialization: teacher.specialization,
        },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return teacher;
  }

  /**
   * List teachers scoped to tenant with search and pagination
   */
  static async listTeachers(
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    // Strict tenant isolation filter
    const filter: any = { schoolId };

    if (params.status) {
      filter.status = params.status;
    }

    if (params.search) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { employeeId: regex },
        { email: regex },
        { qualification: regex },
        { specialization: regex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Teacher.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean(),
      Teacher.countDocuments(filter),
    ]);

    return {
      teachers: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get teacher by ID strictly verified against tenant
   */
  static async getTeacherById(id: string, schoolId: string): Promise<ITeacher> {
    const teacher = await Teacher.findOne({ _id: id, schoolId }).lean();
    if (!teacher) {
      throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
    }
    return teacher as unknown as ITeacher;
  }

  /**
   * Update teacher strictly verified against tenant
   */
  static async updateTeacher(
    id: string,
    schoolId: string,
    updateData: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<ITeacher> {
    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
    }

    const before = teacher.toObject();
    Object.assign(teacher, updateData);
    await teacher.save();

    if (teacher.userId && (updateData.firstName || updateData.lastName || updateData.phone)) {
      await User.findByIdAndUpdate(teacher.userId, {
        name: `${teacher.firstName} ${teacher.lastName}`.trim(),
        phone: teacher.phone,
      });
    }

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'TEACHER_UPDATED',
        resource: 'teachers',
        resourceId: teacher._id.toString(),
        before,
        after: teacher.toObject(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return teacher;
  }

  /**
   * Delete teacher strictly verified against tenant
   */
  static async deleteTeacher(id: string, schoolId: string, actorId?: string): Promise<void> {
    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
    }

    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { status: 'INACTIVE' });
    }

    await Teacher.deleteOne({ _id: id, schoolId });

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'TEACHER_DELETED',
        resource: 'teachers',
        resourceId: id,
      });
    }
  }
}
