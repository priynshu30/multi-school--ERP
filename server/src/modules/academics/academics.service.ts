import { AcademicYear } from './academicYear.model.js';
import { Class } from './class.model.js';
import { Section } from './section.model.js';
import { Subject } from './subject.model.js';
import { Student } from '../students/student.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/appError.js';

export class AcademicsService {
  // ================= Academic Years =================
  static async listAcademicYears(schoolId: string) {
    return AcademicYear.find({ schoolId }).sort({ startDate: -1 }).lean();
  }

  static async createAcademicYear(schoolId: string, data: any) {
    const existing = await AcademicYear.findOne({ schoolId, name: data.name.trim() });
    if (existing) {
      throw new ConflictError(`Academic year '${data.name}' already exists`, 'DUPLICATE_ACADEMIC_YEAR');
    }
    if (data.isCurrent) {
      await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
    }
    return AcademicYear.create({ ...data, name: data.name.trim(), schoolId });
  }

  static async updateAcademicYear(schoolId: string, id: string, data: any) {
    const year = await AcademicYear.findOne({ _id: id, schoolId });
    if (!year) throw new NotFoundError('Academic year not found');

    if (data.name && data.name.trim() !== year.name) {
      const dup = await AcademicYear.findOne({ schoolId, name: data.name.trim(), _id: { $ne: id } });
      if (dup) throw new ConflictError(`Academic year '${data.name}' already exists`);
      year.name = data.name.trim();
    }

    if (data.startDate) year.startDate = data.startDate;
    if (data.endDate) year.endDate = data.endDate;

    if (data.isCurrent !== undefined && data.isCurrent !== year.isCurrent) {
      if (data.isCurrent) {
        await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
      }
      year.isCurrent = data.isCurrent;
    }

    await year.save();
    return year;
  }

  static async setActiveAcademicYear(schoolId: string, id: string) {
    const year = await AcademicYear.findOne({ _id: id, schoolId });
    if (!year) throw new NotFoundError('Academic year not found');

    await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
    year.isCurrent = true;
    await year.save();
    return year;
  }

  static async deleteAcademicYear(schoolId: string, id: string) {
    const year = await AcademicYear.findOne({ _id: id, schoolId });
    if (!year) throw new NotFoundError('Academic year not found');
    if (year.isCurrent) {
      throw new BadRequestError('Cannot delete the active academic year');
    }
    await year.deleteOne();
  }

  // ================= Classes =================
  static async listClasses(schoolId: string) {
    const classes = await Class.find({ schoolId }).sort({ order: 1, name: 1 }).lean();
    const classIds = classes.map((c) => c._id);

    const [sections, studentCounts] = await Promise.all([
      Section.find({ schoolId, classId: { $in: classIds } })
        .populate('classTeacherId', 'firstName lastName employeeId email phone')
        .sort({ name: 1 })
        .lean(),
      Student.aggregate([
        { $match: { schoolId: new (await import('mongoose')).default.Types.ObjectId(schoolId), status: 'ACTIVE' } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
      ]),
    ]);

    const studentCountMap = new Map(studentCounts.map((s) => [s._id ? s._id.toString() : '', s.count]));

    const sectionsByClass = new Map<string, any[]>();
    for (const sec of sections) {
      const cid = sec.classId.toString();
      if (!sectionsByClass.has(cid)) sectionsByClass.set(cid, []);
      sectionsByClass.get(cid)!.push(sec);
    }

    return classes.map((cls) => ({
      ...cls,
      studentCount: studentCountMap.get(cls._id.toString()) || 0,
      sections: sectionsByClass.get(cls._id.toString()) || [],
    }));
  }

  static async createClass(schoolId: string, data: any) {
    const existing = await Class.findOne({ schoolId, name: data.name.trim() });
    if (existing) {
      throw new ConflictError(`Class '${data.name}' already exists`, 'DUPLICATE_CLASS');
    }
    return Class.create({ ...data, name: data.name.trim(), schoolId });
  }

  static async updateClass(schoolId: string, id: string, data: any) {
    const cls = await Class.findOne({ _id: id, schoolId });
    if (!cls) throw new NotFoundError('Class not found');

    if (data.name && data.name.trim() !== cls.name) {
      const dup = await Class.findOne({ schoolId, name: data.name.trim(), _id: { $ne: id } });
      if (dup) throw new ConflictError(`Class '${data.name}' already exists`);
      cls.name = data.name.trim();
    }
    if (data.order !== undefined) cls.order = Number(data.order);
    await cls.save();
    return cls;
  }

  static async deleteClass(schoolId: string, id: string) {
    const cls = await Class.findOne({ _id: id, schoolId });
    if (!cls) throw new NotFoundError('Class not found');

    // Check if students are assigned to this class
    const studentCount = await Student.countDocuments({ schoolId, classId: id, status: 'ACTIVE' });
    if (studentCount > 0) {
      throw new BadRequestError(`Cannot delete class with ${studentCount} actively enrolled student(s)`);
    }

    // Delete associated sections
    await Section.deleteMany({ schoolId, classId: id });
    await Subject.deleteMany({ schoolId, classId: id });
    await cls.deleteOne();
  }

  // ================= Sections =================
  static async listSections(schoolId: string, classId?: string) {
    const filter: any = { schoolId };
    if (classId) filter.classId = classId;
    return Section.find(filter)
      .populate('classId', 'name order')
      .populate('classTeacherId', 'firstName lastName employeeId email')
      .sort({ name: 1 })
      .lean();
  }

  static async createSection(schoolId: string, data: any) {
    const existing = await Section.findOne({
      schoolId,
      classId: data.classId,
      name: data.name.trim().toUpperCase(),
    });
    if (existing) {
      throw new ConflictError(`Section '${data.name}' already exists for this class`, 'DUPLICATE_SECTION');
    }
    return Section.create({
      ...data,
      schoolId,
      name: data.name.trim().toUpperCase(),
      classTeacherId: data.classTeacherId || null,
      capacity: Number(data.capacity) || 40,
    });
  }

  static async updateSection(schoolId: string, id: string, data: any) {
    const sec = await Section.findOne({ _id: id, schoolId });
    if (!sec) throw new NotFoundError('Section not found');

    if (data.name && data.name.trim().toUpperCase() !== sec.name) {
      const dup = await Section.findOne({
        schoolId,
        classId: sec.classId,
        name: data.name.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (dup) throw new ConflictError(`Section '${data.name}' already exists for this class`);
      sec.name = data.name.trim().toUpperCase();
    }

    if (data.capacity !== undefined) sec.capacity = Number(data.capacity);
    if (data.classTeacherId !== undefined) sec.classTeacherId = data.classTeacherId || null;

    await sec.save();
    return sec;
  }

  static async deleteSection(schoolId: string, id: string) {
    const sec = await Section.findOne({ _id: id, schoolId });
    if (!sec) throw new NotFoundError('Section not found');

    const studentCount = await Student.countDocuments({ schoolId, sectionId: id, status: 'ACTIVE' });
    if (studentCount > 0) {
      throw new BadRequestError(`Cannot delete section with ${studentCount} actively enrolled student(s)`);
    }

    await sec.deleteOne();
  }

  // ================= Subjects =================
  static async listSubjects(schoolId: string, classId?: string) {
    const filter: any = { schoolId };
    if (classId) filter.classId = classId;
    return Subject.find(filter)
      .populate('classId', 'name order')
      .populate('teacherId', 'firstName lastName employeeId email')
      .sort({ name: 1 })
      .lean();
  }

  static async createSubject(schoolId: string, data: any) {
    return Subject.create({
      ...data,
      schoolId,
      name: data.name.trim(),
      code: data.code ? data.code.trim().toUpperCase() : undefined,
      classId: data.classId || null,
      teacherId: data.teacherId || null,
      isOptional: Boolean(data.isOptional),
    });
  }

  static async updateSubject(schoolId: string, id: string, data: any) {
    const sub = await Subject.findOne({ _id: id, schoolId });
    if (!sub) throw new NotFoundError('Subject not found');

    if (data.name) sub.name = data.name.trim();
    if (data.code !== undefined) sub.code = data.code ? data.code.trim().toUpperCase() : '';
    if (data.classId !== undefined) sub.classId = data.classId || null;
    if (data.teacherId !== undefined) sub.teacherId = data.teacherId || null;
    if (data.isOptional !== undefined) sub.isOptional = Boolean(data.isOptional);

    await sub.save();
    return sub;
  }

  static async deleteSubject(schoolId: string, id: string) {
    const sub = await Subject.findOne({ _id: id, schoolId });
    if (!sub) throw new NotFoundError('Subject not found');
    await sub.deleteOne();
  }

  // ================= Batch Student Promotion =================
  static async promoteStudents(
    schoolId: string,
    params: {
      studentIds: string[];
      targetClassId: string;
      targetSectionId?: string;
      targetAcademicYear: string;
    }
  ) {
    const { studentIds, targetClassId, targetSectionId, targetAcademicYear } = params;
    if (!studentIds || studentIds.length === 0) {
      throw new BadRequestError('At least one student must be selected for promotion');
    }

    const targetClass = await Class.findOne({ _id: targetClassId, schoolId });
    if (!targetClass) throw new NotFoundError('Target class not found');

    const updatePayload: any = {
      classId: targetClassId,
      academicYear: targetAcademicYear,
    };
    if (targetSectionId) {
      updatePayload.sectionId = targetSectionId;
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds }, schoolId },
      { $set: updatePayload }
    );

    return {
      promotedCount: result.modifiedCount,
      targetClassName: targetClass.name,
      academicYear: targetAcademicYear,
    };
  }
}
