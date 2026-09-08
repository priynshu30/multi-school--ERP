import bcrypt from 'bcryptjs';
import { School, ISchool } from './school.model.js';
import { User } from '../users/user.model.js';
import { Staff } from '../staff/staff.model.js';
import { Teacher } from '../teachers/teacher.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { ConflictError, NotFoundError } from '../../utils/appError.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../../constants/roles.js';

export class SchoolService {
  /**
   * Create school with optional initial school admin user
   */
  static async createSchoolWithAdmin(
    schoolData: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ school: ISchool; adminUser?: any }> {
    const { initialAdmin, ...coreData } = schoolData;

    // Check code and slug uniqueness
    const existingCode = await School.findOne({ code: coreData.code.toUpperCase() });
    if (existingCode) {
      throw new ConflictError(`School code '${coreData.code}' is already registered`, 'DUPLICATE_CODE');
    }

    const existingSlug = await School.findOne({ slug: coreData.slug.toLowerCase() });
    if (existingSlug) {
      throw new ConflictError(`School slug '${coreData.slug}' is already taken`, 'DUPLICATE_SLUG');
    }

    // Create school
    const school = await School.create({
      ...coreData,
      code: coreData.code.toUpperCase(),
      slug: coreData.slug.toLowerCase(),
    });

    let adminUser = null;
    if (initialAdmin && initialAdmin.email && initialAdmin.password) {
      const existingUser = await User.findOne({ email: initialAdmin.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError(`Email '${initialAdmin.email}' is already associated with an account`, 'DUPLICATE_EMAIL');
      }

      const passwordHash = await bcrypt.hash(initialAdmin.password, 10);
      adminUser = await User.create({
        schoolId: school._id,
        name: initialAdmin.name,
        email: initialAdmin.email.toLowerCase(),
        phone: initialAdmin.phone,
        passwordHash,
        role: ROLES.SCHOOL_ADMIN,
        permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
        status: 'ACTIVE',
      });
    }

    // Audit log
    if (actorId) {
      await AuditLog.create({
        schoolId: school._id,
        userId: actorId,
        action: 'SCHOOL_CREATED',
        resource: 'schools',
        resourceId: school._id.toString(),
        after: { name: school.name, code: school.code, slug: school.slug },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return {
      school,
      adminUser: adminUser
        ? {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
          }
        : undefined,
    };
  }

  /**
   * List schools with search, filtering and pagination
   */
  static async listSchools(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    planId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (params.status) {
      filter.status = params.status;
    }

    if (params.planId) {
      filter.planId = params.planId;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { slug: searchRegex },
        { city: searchRegex },
        { email: searchRegex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const [schools, total] = await Promise.all([
      School.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      School.countDocuments(filter),
    ]);

    // Attach real counts for each school
    const schoolIds = schools.map((s) => s._id);
    const [staffCounts, teacherCounts] = await Promise.all([
      Staff.aggregate([
        { $match: { schoolId: { $in: schoolIds } } },
        { $group: { _id: '$schoolId', count: { $sum: 1 } } },
      ]),
      Teacher.aggregate([
        { $match: { schoolId: { $in: schoolIds } } },
        { $group: { _id: '$schoolId', count: { $sum: 1 } } },
      ]),
    ]);

    const staffMap = new Map(staffCounts.map((item) => [item._id.toString(), item.count]));
    const teacherMap = new Map(teacherCounts.map((item) => [item._id.toString(), item.count]));

    const enriched = schools.map((sch) => ({
      ...sch,
      staffCount: staffMap.get(sch._id.toString()) || 0,
      teacherCount: teacherMap.get(sch._id.toString()) || 0,
    }));

    return {
      schools: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get school details by ID with statistics
   */
  static async getSchoolDetails(id: string) {
    const school = await School.findById(id).lean();
    if (!school) {
      throw new NotFoundError('School not found', 'SCHOOL_NOT_FOUND');
    }

    const [staffCount, teacherCount, adminUsers] = await Promise.all([
      Staff.countDocuments({ schoolId: school._id }),
      Teacher.countDocuments({ schoolId: school._id }),
      User.find({ schoolId: school._id, role: ROLES.SCHOOL_ADMIN })
        .select('-passwordHash')
        .lean(),
    ]);

    return {
      ...school,
      stats: {
        staffCount,
        teacherCount,
        adminCount: adminUsers.length,
      },
      administrators: adminUsers,
    };
  }

  /**
   * Update school details
   */
  static async updateSchool(
    id: string,
    updateData: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ) {
    const school = await School.findById(id);
    if (!school) {
      throw new NotFoundError('School not found', 'SCHOOL_NOT_FOUND');
    }

    const before = school.toObject();
    Object.assign(school, updateData);
    await school.save();

    if (actorId) {
      await AuditLog.create({
        schoolId: school._id,
        userId: actorId,
        action: 'SCHOOL_UPDATED',
        resource: 'schools',
        resourceId: school._id.toString(),
        before,
        after: school.toObject(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return school;
  }

  /**
   * Set school status (ACTIVE, SUSPENDED, ARCHIVED)
   */
  static async setSchoolStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED',
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ) {
    const school = await School.findById(id);
    if (!school) {
      throw new NotFoundError('School not found', 'SCHOOL_NOT_FOUND');
    }

    const previousStatus = school.status;
    school.status = status;
    await school.save();

    if (actorId) {
      await AuditLog.create({
        schoolId: school._id,
        userId: actorId,
        action: `SCHOOL_${status}`,
        resource: 'schools',
        resourceId: school._id.toString(),
        before: { status: previousStatus },
        after: { status },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return school;
  }

  /**
   * Platform-wide aggregated statistics for Super Admin dashboard
   */
  static async getPlatformStats() {
    const [
      totalSchools,
      activeSchools,
      suspendedSchools,
      totalUsers,
      totalStaff,
      totalTeachers,
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ status: 'ACTIVE' }),
      School.countDocuments({ status: 'SUSPENDED' }),
      User.countDocuments(),
      Staff.countDocuments(),
      Teacher.countDocuments(),
    ]);

    return {
      totalSchools,
      activeSchools,
      suspendedSchools,
      totalUsers,
      totalStaff,
      totalTeachers,
    };
  }

  /**
   * School-specific statistics for School Admin dashboard
   */
  static async getSchoolStats(schoolId: string) {
    const [totalStaff, totalTeachers, activeUsers] = await Promise.all([
      Staff.countDocuments({ schoolId, status: 'ACTIVE' }),
      Teacher.countDocuments({ schoolId, status: 'ACTIVE' }),
      User.countDocuments({ schoolId, status: 'ACTIVE' }),
    ]);

    return {
      totalStaff,
      totalTeachers,
      activeUsers,
    };
  }
}
