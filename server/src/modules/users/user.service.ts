import bcrypt from 'bcryptjs';
import { User, IUser } from './user.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/appError.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../../constants/roles.js';

export class UserService {
  /**
   * Create new user under school tenant
   */
  static async createUser(
    schoolId: string | null,
    data: any,
    creatorRole: string,
    actorId?: string
  ): Promise<Partial<IUser>> {
    // Prevent non-superadmins from creating SUPER_ADMIN users
    if (data.role === ROLES.SUPER_ADMIN && creatorRole !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('You cannot create a Super Admin account', 'PRIVILEGE_ESCALATION');
    }

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError(`User with email '${data.email}' already exists`, 'DUPLICATE_EMAIL');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const permissions = DEFAULT_ROLE_PERMISSIONS[data.role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];

    const user = await User.create({
      ...data,
      schoolId: creatorRole === ROLES.SUPER_ADMIN ? (data.schoolId || null) : schoolId,
      email: data.email.toLowerCase(),
      passwordHash,
      permissions,
    });

    if (actorId) {
      await AuditLog.create({
        schoolId: user.schoolId || null,
        userId: actorId,
        action: 'USER_CREATED',
        resource: 'users',
        resourceId: user._id.toString(),
        after: { email: user.email, role: user.role },
      });
    }

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }

  /**
   * List users scoped to tenant
   */
  static async listUsers(
    schoolId: string | null,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (schoolId) {
      filter.schoolId = schoolId;
    }

    if (params.status) {
      filter.status = params.status;
    }

    if (params.role) {
      filter.role = params.role;
    }

    if (params.search) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get user by ID strictly within tenant
   */
  static async getUserById(id: string, schoolId: string | null): Promise<Partial<IUser>> {
    const filter: any = { _id: id };
    if (schoolId) {
      filter.schoolId = schoolId;
    }

    const user = await User.findOne(filter).select('-passwordHash').lean();
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return user as unknown as Partial<IUser>;
  }

  /**
   * Update user status (active / inactive / suspended)
   */
  static async setUserStatus(
    id: string,
    schoolId: string | null,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    actorRole: string,
    actorId?: string
  ): Promise<Partial<IUser>> {
    const filter: any = { _id: id };
    if (schoolId) {
      filter.schoolId = schoolId;
    }

    const user = await User.findOne(filter);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Protect SUPER_ADMIN from being modified by school admins
    if (user.role === ROLES.SUPER_ADMIN && actorRole !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot modify a Super Admin user', 'FORBIDDEN');
    }

    user.status = status;
    await user.save();

    if (actorId) {
      await AuditLog.create({
        schoolId: user.schoolId || null,
        userId: actorId,
        action: `USER_${status}`,
        resource: 'users',
        resourceId: user._id.toString(),
      });
    }

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }
}
