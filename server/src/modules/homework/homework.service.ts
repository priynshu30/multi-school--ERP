import { Homework } from './homework.model.js';
import { NotFoundError } from '../../utils/appError.js';
import mongoose from 'mongoose';

export class HomeworkService {
  static async listHomework(
    schoolId: string,
    params: { classId?: string; sectionId?: string; subjectId?: string }
  ) {
    const filter: any = { schoolId, status: 'ACTIVE' };
    if (params.classId) filter.classId = params.classId;
    if (params.sectionId) filter.sectionId = params.sectionId;
    if (params.subjectId) filter.subjectId = params.subjectId;

    return Homework.find(filter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: 1 })
      .lean();
  }

  static async createHomework(schoolId: string, data: any, teacherId?: string) {
    return Homework.create({
      ...data,
      schoolId,
      teacherId: teacherId || data.teacherId || null,
      dueDate: new Date(data.dueDate),
    });
  }

  static async getHomeworkDetails(schoolId: string, id: string) {
    const hw = await Homework.findOne({ _id: id, schoolId })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .populate('submissions.studentId', 'firstName lastName admissionNumber rollNumber')
      .lean();

    if (!hw) throw new NotFoundError('Homework assignment not found');
    return hw;
  }

  static async deleteHomework(schoolId: string, id: string) {
    const hw = await Homework.findOne({ _id: id, schoolId });
    if (!hw) throw new NotFoundError('Homework assignment not found');
    await hw.deleteOne();
  }
}
