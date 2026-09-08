import bcrypt from 'bcryptjs';
import { Staff, IStaff } from './staff.model.js';
import { User } from '../users/user.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { ConflictError, NotFoundError } from '../../utils/appError.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../../constants/roles.js';

export class StaffService {
  /**
   * Create new staff member under the specified school tenant
   */
  static async createStaff(
    schoolId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IStaff> {
    const { createAccount, password, ...staffData } = data;

    // Verify employeeId is unique in this school
    const existingEmp = await Staff.findOne({
      schoolId,
      employeeId: staffData.employeeId.toUpperCase(),
    });
    if (existingEmp) {
      throw new ConflictError(
        `Employee ID '${staffData.employeeId}' is already in use at this school`,
        'DUPLICATE_EMPLOYEE_ID'
      );
    }

    let linkedUserId = null;
    if (createAccount) {
      const existingUser = await User.findOne({ email: staffData.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError(
          `User with email '${staffData.email}' already exists`,
          'DUPLICATE_EMAIL'
        );
      }

      const passwordHash = await bcrypt.hash(password || 'Staff@123', 10);
      const newUser = await User.create({
        schoolId,
        name: `${staffData.firstName} ${staffData.lastName}`.trim(),
        email: staffData.email.toLowerCase(),
        phone: staffData.phone,
        passwordHash,
        role: ROLES.STAFF,
        permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
        status: staffData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      });
      linkedUserId = newUser._id;
    }

    const staff = await Staff.create({
      ...staffData,
      schoolId,
      userId: linkedUserId,
      employeeId: staffData.employeeId.toUpperCase(),
    });

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STAFF_CREATED',
        resource: 'staff',
        resourceId: staff._id.toString(),
        after: {
          employeeId: staff.employeeId,
          name: `${staff.firstName} ${staff.lastName}`,
          department: staff.department,
        },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return staff;
  }

  /**
   * List staff scoped to tenant with search, filtering and pagination
   */
  static async listStaff(
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      department?: string;
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

    if (params.department) {
      filter.department = params.department;
    }

    if (params.search) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { employeeId: regex },
        { email: regex },
        { designation: regex },
        { department: regex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Staff.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean(),
      Staff.countDocuments(filter),
    ]);

    return {
      staff: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get staff by ID strictly verified against tenant
   */
  static async getStaffById(id: string, schoolId: string): Promise<IStaff> {
    const staff = await Staff.findOne({ _id: id, schoolId }).lean();
    if (!staff) {
      throw new NotFoundError('Staff member not found', 'STAFF_NOT_FOUND');
    }
    return staff as unknown as IStaff;
  }

  /**
   * Update staff member strictly verified against tenant
   */
  static async updateStaff(
    id: string,
    schoolId: string,
    updateData: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IStaff> {
    const staff = await Staff.findOne({ _id: id, schoolId });
    if (!staff) {
      throw new NotFoundError('Staff member not found', 'STAFF_NOT_FOUND');
    }

    const before = staff.toObject();
    Object.assign(staff, updateData);
    await staff.save();

    // If name or phone changed, update linked user
    if (staff.userId && (updateData.firstName || updateData.lastName || updateData.phone)) {
      await User.findByIdAndUpdate(staff.userId, {
        name: `${staff.firstName} ${staff.lastName}`.trim(),
        phone: staff.phone,
      });
    }

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STAFF_UPDATED',
        resource: 'staff',
        resourceId: staff._id.toString(),
        before,
        after: staff.toObject(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return staff;
  }

  /**
   * Delete staff member strictly verified against tenant
   */
  static async deleteStaff(id: string, schoolId: string, actorId?: string): Promise<void> {
    const staff = await Staff.findOne({ _id: id, schoolId });
    if (!staff) {
      throw new NotFoundError('Staff member not found', 'STAFF_NOT_FOUND');
    }

    if (staff.userId) {
      await User.findByIdAndUpdate(staff.userId, { status: 'INACTIVE' });
    }

    await Staff.deleteOne({ _id: id, schoolId });

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'STAFF_DELETED',
        resource: 'staff',
        resourceId: id,
      });
    }
  }
}
