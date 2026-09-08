import { Request, Response, NextFunction } from 'express';
import { FeeService } from './fee.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class FeeController {
  // Structures
  static async listFeeStructures(req: Request, res: Response, next: NextFunction) {
    try {
      const structures = await FeeService.listFeeStructures(req.schoolId!);
      return ApiResponse.success(res, structures, 'Fee structures retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createFeeStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await FeeService.createFeeStructure(req.schoolId!, req.body);
      return ApiResponse.success(res, structure, 'Fee structure created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Invoices
  static async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.listInvoices(req.schoolId!, req.query as any);
      return ApiResponse.paginated(res, result.invoices, result.pagination, 'Invoices retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await FeeService.getInvoiceDetails(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, invoice, 'Invoice details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async generateInvoicesForClass(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.generateInvoicesForClass(req.schoolId!, req.body);
      return ApiResponse.success(res, result, 'Invoices generated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Payment Collection
  static async collectPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.collectPayment(
        req.schoolId!,
        req.body,
        req.user?.userId
      );
      return ApiResponse.success(res, result, 'Payment recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Financial Telemetry
  static async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await FeeService.getFinancialSummary(req.schoolId!);
      return ApiResponse.success(res, summary, 'Financial summary retrieved');
    } catch (error) {
      next(error);
    }
  }
}
