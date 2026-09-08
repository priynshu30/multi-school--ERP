import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ReportsController {
  static async getExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await ReportsService.getExecutiveSummary(req.schoolId!);
      return ApiResponse.success(res, summary, 'Executive summary analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getStudentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportsService.getStudentReport(req.schoolId!);
      return ApiResponse.success(res, report, 'Student enrollment analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getAttendanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const report = await ReportsService.getAttendanceReport(req.schoolId!, days);
      return ApiResponse.success(res, report, 'Attendance trends retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getFeeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportsService.getFeeReport(req.schoolId!);
      return ApiResponse.success(res, report, 'Fee collection report retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getExamReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportsService.getExamReport(req.schoolId!);
      return ApiResponse.success(res, report, 'Exam performance report retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getTransportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportsService.getTransportReport(req.schoolId!);
      return ApiResponse.success(res, report, 'Transport utilization report retrieved');
    } catch (err) {
      next(err);
    }
  }
}
