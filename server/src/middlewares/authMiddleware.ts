import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/appError.js';
import { User } from '../modules/users/user.model.js';
import { AuthUserPayload } from '../types/express.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: any;
  schoolId?: string | null;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token is missing', 'TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    // Verify user still exists and is ACTIVE
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      throw new UnauthorizedError('User account not found', 'USER_NOT_FOUND');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}`, 'ACCOUNT_DISABLED');
    }

    const authPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
      permissions: user.permissions || [],
    };

    req.user = authPayload;
    next();
  } catch (error) {
    next(error);
  }
};
