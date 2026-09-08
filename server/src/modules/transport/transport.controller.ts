import { Request, Response, NextFunction } from 'express';
import { TransportService } from './transport.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class TransportController {
  // --- Buses ---
  static async getBuses(req: Request, res: Response, next: NextFunction) {
    try {
      const buses = await TransportService.getBuses(req.schoolId!);
      return ApiResponse.success(res, buses, 'Buses fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createBus(req: Request, res: Response, next: NextFunction) {
    try {
      const bus = await TransportService.createBus(req.schoolId!, req.body);
      return ApiResponse.success(res, bus, 'Bus registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateBus(req: Request, res: Response, next: NextFunction) {
    try {
      const bus = await TransportService.updateBus(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, bus, 'Bus updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteBus(req: Request, res: Response, next: NextFunction) {
    try {
      await TransportService.deleteBus(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Bus deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Drivers ---
  static async getDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const drivers = await TransportService.getDrivers(req.schoolId!);
      return ApiResponse.success(res, drivers, 'Drivers fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await TransportService.createDriver(req.schoolId!, req.body);
      return ApiResponse.success(res, driver, 'Driver registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await TransportService.updateDriver(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, driver, 'Driver updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteDriver(req: Request, res: Response, next: NextFunction) {
    try {
      await TransportService.deleteDriver(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Driver deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Routes ---
  static async getRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await TransportService.getRoutes(req.schoolId!);
      return ApiResponse.success(res, routes, 'Routes fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const route = await TransportService.createRoute(req.schoolId!, req.body);
      return ApiResponse.success(res, route, 'Route created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const route = await TransportService.updateRoute(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, route, 'Route updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteRoute(req: Request, res: Response, next: NextFunction) {
    try {
      await TransportService.deleteRoute(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Route deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Student Assignments ---
  static async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await TransportService.getAssignments(req.schoolId!);
      return ApiResponse.success(res, assignments, 'Transport assignments fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async assignStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await TransportService.assignStudent(req.schoolId!, req.body);
      return ApiResponse.success(res, assignment, 'Student assigned to bus transport', 201);
    } catch (err) {
      next(err);
    }
  }

  static async removeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await TransportService.removeAssignment(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Transport assignment removed');
    } catch (err) {
      next(err);
    }
  }

  // --- GPS Live Tracking ---
  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const loc = await TransportService.updateLocation(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, loc, 'Bus location updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getLiveFleet(req: Request, res: Response, next: NextFunction) {
    try {
      const fleet = await TransportService.getLiveFleet(req.schoolId!);
      return ApiResponse.success(res, fleet, 'Live fleet tracking data fetched');
    } catch (err) {
      next(err);
    }
  }
}
