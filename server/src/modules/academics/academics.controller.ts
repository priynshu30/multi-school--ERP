import { Request, Response, NextFunction } from 'express';
import { AcademicsService } from './academics.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AcademicsController {
  // ================= Academic Years =================
  static async listAcademicYears(req: Request, res: Response, next: NextFunction) {
    try {
      const years = await AcademicsService.listAcademicYears(req.schoolId!);
      return ApiResponse.success(res, years, 'Academic years retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await AcademicsService.createAcademicYear(req.schoolId!, req.body);
      return ApiResponse.success(res, year, 'Academic year created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await AcademicsService.updateAcademicYear(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, year, 'Academic year updated');
    } catch (error) {
      next(error);
    }
  }

  static async setActiveAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await AcademicsService.setActiveAcademicYear(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, year, 'Active academic year updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      await AcademicsService.deleteAcademicYear(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Academic year deleted');
    } catch (error) {
      next(error);
    }
  }

  // ================= Classes =================
  static async listClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const classes = await AcademicsService.listClasses(req.schoolId!);
      return ApiResponse.success(res, classes, 'Classes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const cls = await AcademicsService.createClass(req.schoolId!, req.body);
      return ApiResponse.success(res, cls, 'Class created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const cls = await AcademicsService.updateClass(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, cls, 'Class updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      await AcademicsService.deleteClass(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Class deleted');
    } catch (error) {
      next(error);
    }
  }

  // ================= Sections =================
  static async listSections(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.query.classId as string | undefined;
      const sections = await AcademicsService.listSections(req.schoolId!, classId);
      return ApiResponse.success(res, sections, 'Sections retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const sec = await AcademicsService.createSection(req.schoolId!, req.body);
      return ApiResponse.success(res, sec, 'Section created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const sec = await AcademicsService.updateSection(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, sec, 'Section updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      await AcademicsService.deleteSection(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Section deleted');
    } catch (error) {
      next(error);
    }
  }

  // ================= Subjects =================
  static async listSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.query.classId as string | undefined;
      const subjects = await AcademicsService.listSubjects(req.schoolId!, classId);
      return ApiResponse.success(res, subjects, 'Subjects retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await AcademicsService.createSubject(req.schoolId!, req.body);
      return ApiResponse.success(res, sub, 'Subject created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await AcademicsService.updateSubject(req.schoolId!, req.params.id as string, req.body);
      return ApiResponse.success(res, sub, 'Subject updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(req: Request, res: Response, next: NextFunction) {
    try {
      await AcademicsService.deleteSubject(req.schoolId!, req.params.id as string);
      return ApiResponse.success(res, null, 'Subject deleted');
    } catch (error) {
      next(error);
    }
  }

  // ================= Batch Promotion =================
  static async promoteStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicsService.promoteStudents(req.schoolId!, req.body);
      return ApiResponse.success(res, result, 'Students promoted successfully');
    } catch (error) {
      next(error);
    }
  }
}
