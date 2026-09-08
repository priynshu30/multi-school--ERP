import { AuditLog } from './auditLog.model.js';

export class AuditService {
  static async getAuditLogs(query: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    schoolId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.schoolId) filter.schoolId = query.schoolId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .populate('schoolId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async logAction(data: {
    schoolId?: string | null;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    before?: any;
    after?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await AuditLog.create(data);
    } catch (err) {
      console.error('Failed to write audit log entry', err);
    }
  }
}
