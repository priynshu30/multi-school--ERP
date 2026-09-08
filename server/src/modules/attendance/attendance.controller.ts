import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AttendanceController {
  // Student roll call sheet
  static async getClassAttendanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const sheet = await AttendanceService.getClassAttendanceSheet(schoolId, req.query as any);
      return ApiResponse.success(res, sheet, 'Attendance sheet retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Save bulk student attendance
  static async markBulkStudentAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await AttendanceService.markBulkStudentAttendance(
        schoolId,
        req.body,
        req.user?.userId
      );
      return ApiResponse.success(res, result, 'Student attendance saved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Staff roll call sheet
  static async getStaffAttendanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const sheet = await AttendanceService.getStaffAttendanceSheet(schoolId, date);
      return ApiResponse.success(res, sheet, 'Staff attendance sheet retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Save bulk staff attendance
  static async markBulkStaffAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await AttendanceService.markBulkStaffAttendance(
        schoolId,
        req.body,
        req.user?.userId
      );
      return ApiResponse.success(res, result, 'Staff attendance saved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Summary / report
  static async getMonthlyAttendanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const summary = await AttendanceService.getMonthlyAttendanceSummary(schoolId, req.query as any);
      return ApiResponse.success(res, summary, 'Attendance summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Ingest biometric punch
  static async ingestBiometricPunch(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const result = await AttendanceService.ingestBiometricPunch(schoolId, req.body);
      return ApiResponse.success(res, result, 'Biometric event processed');
    } catch (error) {
      next(error);
    }
  }

  // List biometric logs
  static async listBiometricLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.schoolId!;
      const limit = Number(req.query.limit) || 50;
      const logs = await AttendanceService.listBiometricLogs(schoolId, limit);
      return ApiResponse.success(res, logs, 'Biometric logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}
