import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';

export const requireTenant = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Super Admins can access tenant-specific resources or global resources
  if (req.user.role === ROLES.SUPER_ADMIN) {
    // If super admin specifies a school context via header or query, attach it
    const rawHeader = req.headers['x-school-id'];
    const headerSchoolId = typeof rawHeader === 'string' ? rawHeader : Array.isArray(rawHeader) ? rawHeader[0] : undefined;
    const querySchoolId = typeof req.query.schoolId === 'string' ? req.query.schoolId : undefined;
    const explicitSchoolId = headerSchoolId || querySchoolId || req.params.schoolId;
    if (explicitSchoolId) {
      req.schoolId = String(explicitSchoolId);
    }
    return next();
  }

  // Regular tenant users MUST have a schoolId
  if (!req.user.schoolId) {
    return next(
      new ForbiddenError('User is not assigned to any school tenant', 'NO_TENANT_ASSIGNED')
    );
  }

  const userSchoolId = req.user.schoolId;

  // Strict cross-tenant check: if client sent schoolId in params/query/body, it must match
  const requestedSchoolId = req.params.schoolId || (req.query.schoolId as string) || req.body?.schoolId;
  if (requestedSchoolId && requestedSchoolId.toString() !== userSchoolId) {
    return next(
      new ForbiddenError(
        'Cross-tenant access forbidden. You cannot access or modify resources of another school.',
        'CROSS_TENANT_ACCESS_FORBIDDEN'
      )
    );
  }

  // Always force tenant scope to authenticated user's schoolId
  req.schoolId = userSchoolId;
  if (req.body && typeof req.body === 'object') {
    req.body.schoolId = userSchoolId;
  }

  next();
};
