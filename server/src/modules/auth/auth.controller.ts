import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { User } from '../users/user.model.js';
import { School } from '../schools/school.model.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await AuthService.login(email, password, meta);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const tokens = await AuthService.refreshToken(refreshToken, meta);
      return ApiResponse.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const user = await User.findById(req.user.userId).select('-passwordHash').lean();
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      let school = null;
      if (user.schoolId) {
        school = await School.findById(user.schoolId).lean();
      }

      return ApiResponse.success(
        res,
        {
          user,
          school: school ? {
            id: school._id.toString(),
            name: school.name,
            code: school.code,
            slug: school.slug,
            status: school.status,
            currency: school.currency,
          } : null,
        },
        'Profile retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.body;
      const result = await AuthService.sendOtp(identifier);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, otp } = req.body;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };
      const result = await AuthService.verifyOtp(identifier, otp, meta);
      return ApiResponse.success(res, result, 'OTP verified successfully');
    } catch (error) {
      next(error);
    }
  }
}

