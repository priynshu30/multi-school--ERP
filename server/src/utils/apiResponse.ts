import { Response } from 'express';

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginatedMeta,
    message = 'Success',
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    code = 'ERROR',
    details?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(details ? { details } : {}),
    });
  }
}
