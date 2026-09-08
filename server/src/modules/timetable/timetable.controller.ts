import { Request, Response, NextFunction } from 'express';
import { TimetableService } from './timetable.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class TimetableController {
  static async getClassTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.query.classId as string;
      const sectionId = req.query.sectionId as string | undefined;
      const slots = await TimetableService.getClassTimetable(req.schoolId!, classId, sectionId);
      return ApiResponse.success(res, slots, 'Class timetable retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async setSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await TimetableService.setSlot(req.schoolId!, req.body);
      return ApiResponse.success(res, slot, 'Timetable slot saved successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlot(req: Request, res: Response, next: NextFunction) {
    try {
      await TimetableService.deleteSlot(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Timetable slot removed');
    } catch (error) {
      next(error);
    }
  }
}
