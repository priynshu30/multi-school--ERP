import { Parent, IParent } from './parent.model.js';
import { Student } from '../students/student.model.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotFoundError, ConflictError } from '../../utils/appError.js';

export class ParentService {
  /**
   * Create a new parent record
   */
  static async createParent(
    schoolId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IParent> {
    // Email uniqueness within school
    const existing = await Parent.findOne({ schoolId, email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError(
        `A parent with email '${data.email}' already exists in this school`,
        'DUPLICATE_EMAIL'
      );
    }

    const parent = await Parent.create({
      ...data,
      schoolId,
      email: data.email.toLowerCase(),
      children: data.children || [],
    });

    // If children provided, back-link on student records
    if (data.children && data.children.length > 0) {
      await Student.updateMany(
        { _id: { $in: data.children }, schoolId },
        { $set: { parentId: parent._id } }
      );
    }

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'PARENT_CREATED',
        resource: 'parents',
        resourceId: parent._id.toString(),
        after: { name: `${parent.firstName} ${parent.lastName}`, email: parent.email },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return parent;
  }

  /**
   * List parents with search and pagination
   */
  static async listParents(
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
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { schoolId };

    if (params.status) filter.status = params.status;

    if (params.search) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder === 'asc' ? 1 : -1;

    const [parents, total] = await Promise.all([
      Parent.find(filter)
        .populate('children', 'firstName lastName admissionNumber classId')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Parent.countDocuments(filter),
    ]);

    return {
      parents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  /**
   * Get single parent by ID with children details
   */
  static async getParentById(schoolId: string, parentId: string): Promise<IParent> {
    const parent = await Parent.findOne({ _id: parentId, schoolId })
      .populate({
        path: 'children',
        select: 'firstName lastName admissionNumber rollNumber classId sectionId status photo',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .lean();

    if (!parent) {
      throw new NotFoundError('Parent not found', 'PARENT_NOT_FOUND');
    }

    return parent as unknown as IParent;
  }

  /**
   * Update parent details
   */
  static async updateParent(
    schoolId: string,
    parentId: string,
    data: any,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<IParent> {
    const parent = await Parent.findOne({ _id: parentId, schoolId });
    if (!parent) {
      throw new NotFoundError('Parent not found', 'PARENT_NOT_FOUND');
    }

    // Check email uniqueness if changing
    if (data.email && data.email.toLowerCase() !== parent.email) {
      const dup = await Parent.findOne({
        schoolId,
        email: data.email.toLowerCase(),
        _id: { $ne: parentId },
      });
      if (dup) {
        throw new ConflictError(`Email '${data.email}' is already in use`, 'DUPLICATE_EMAIL');
      }
    }

    const before = parent.toObject();
    if (data.email) data.email = data.email.toLowerCase();
    Object.assign(parent, data);
    await parent.save();

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'PARENT_UPDATED',
        resource: 'parents',
        resourceId: parent._id.toString(),
        before,
        after: parent.toObject(),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return parent;
  }

  /**
   * Link a child (student) to a parent
   */
  static async linkChild(
    schoolId: string,
    parentId: string,
    studentId: string
  ): Promise<IParent> {
    const [parent, student] = await Promise.all([
      Parent.findOne({ _id: parentId, schoolId }),
      Student.findOne({ _id: studentId, schoolId }),
    ]);

    if (!parent) throw new NotFoundError('Parent not found', 'PARENT_NOT_FOUND');
    if (!student) throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');

    await Promise.all([
      Parent.findByIdAndUpdate(parentId, { $addToSet: { children: studentId } }),
      Student.findByIdAndUpdate(studentId, { $set: { parentId } }),
    ]);

    return (await Parent.findById(parentId).populate('children', 'firstName lastName admissionNumber').lean()) as unknown as IParent;
  }

  /**
   * Unlink a child from a parent
   */
  static async unlinkChild(
    schoolId: string,
    parentId: string,
    studentId: string
  ): Promise<IParent> {
    const parent = await Parent.findOne({ _id: parentId, schoolId });
    if (!parent) throw new NotFoundError('Parent not found', 'PARENT_NOT_FOUND');

    await Promise.all([
      Parent.findByIdAndUpdate(parentId, { $pull: { children: studentId } }),
      Student.findOneAndUpdate({ _id: studentId, schoolId }, { $set: { parentId: null } }),
    ]);

    return (await Parent.findById(parentId).populate('children', 'firstName lastName admissionNumber').lean()) as unknown as IParent;
  }

  /**
   * Delete a parent
   */
  static async deleteParent(
    schoolId: string,
    parentId: string,
    actorId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {
    const parent = await Parent.findOne({ _id: parentId, schoolId });
    if (!parent) throw new NotFoundError('Parent not found', 'PARENT_NOT_FOUND');

    // Unlink from students
    if (parent.children.length > 0) {
      await Student.updateMany(
        { _id: { $in: parent.children }, schoolId },
        { $set: { parentId: null } }
      );
    }

    await parent.deleteOne();

    if (actorId) {
      await AuditLog.create({
        schoolId,
        userId: actorId,
        action: 'PARENT_DELETED',
        resource: 'parents',
        resourceId: parentId,
        before: { name: `${parent.firstName} ${parent.lastName}`, email: parent.email },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }
  }
}
