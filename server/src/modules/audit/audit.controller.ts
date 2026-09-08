import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
      const action = req.query.action as string | undefined;
      const resource = req.query.resource as string | undefined;
      const schoolId = req.query.schoolId as string | undefined;

      const result = await AuditService.getAuditLogs({
        page,
        limit,
        action,
        resource,
        schoolId,
      });

      return ApiResponse.paginated(
        res,
        result.logs,
        result.pagination,
        'Audit logs retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}
