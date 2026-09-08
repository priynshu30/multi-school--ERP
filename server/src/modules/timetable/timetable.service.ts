import { TimetableSlot, DayOfWeek } from './timetable.model.js';
import { ConflictError, NotFoundError } from '../../utils/appError.js';
import mongoose from 'mongoose';

export class TimetableService {
  // Get weekly grid for a class/section
  static async getClassTimetable(schoolId: string, classId: string, sectionId?: string) {
    const filter: any = { schoolId, classId };
    if (sectionId) filter.sectionId = sectionId;

    return TimetableSlot.find(filter)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name')
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .lean();
  }

  // Set / Upsert a slot with conflict detection
  static async setSlot(
    schoolId: string,
    data: {
      classId: string;
      sectionId?: string;
      dayOfWeek: DayOfWeek;
      periodNumber: number;
      startTime: string;
      endTime: string;
      subjectId: string;
      teacherId?: string;
      room?: string;
    }
  ) {
    const { classId, sectionId, dayOfWeek, periodNumber, teacherId, room } = data;

    // 1. Teacher Conflict Detection: check if teacher is already assigned elsewhere in same slot
    if (teacherId) {
      const teacherConflict = await TimetableSlot.findOne({
        schoolId,
        teacherId,
        dayOfWeek,
        periodNumber,
        $or: [
          { classId: { $ne: classId } },
          { sectionId: { $ne: sectionId || null } },
        ],
      }).populate('classId', 'name');

      if (teacherConflict) {
        throw new ConflictError(
          `Teacher is already assigned to ${teacherConflict.classId ? (teacherConflict.classId as any).name : 'another class'} during ${dayOfWeek} Period ${periodNumber}!`,
          'TEACHER_PERIOD_CONFLICT'
        );
      }
    }

    // 2. Room Conflict Detection
    if (room && room.trim()) {
      const roomConflict = await TimetableSlot.findOne({
        schoolId,
        room: room.trim(),
        dayOfWeek,
        periodNumber,
        $or: [
          { classId: { $ne: classId } },
          { sectionId: { $ne: sectionId || null } },
        ],
      }).populate('classId', 'name');

      if (roomConflict) {
        throw new ConflictError(
          `Room "${room}" is already occupied by ${(roomConflict.classId as any)?.name} during ${dayOfWeek} Period ${periodNumber}!`,
          'ROOM_PERIOD_CONFLICT'
        );
      }
    }

    // Upsert class slot
    const slot = await TimetableSlot.findOneAndUpdate(
      {
        schoolId,
        classId,
        sectionId: sectionId || null,
        dayOfWeek,
        periodNumber,
      },
      {
        $set: {
          startTime: data.startTime,
          endTime: data.endTime,
          subjectId: data.subjectId,
          teacherId: data.teacherId || null,
          room: data.room || '',
        },
      },
      { upsert: true, new: true }
    )
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName');

    return slot;
  }

  // Delete a slot
  static async deleteSlot(schoolId: string, id: string) {
    const slot = await TimetableSlot.findOne({ _id: id, schoolId });
    if (!slot) throw new NotFoundError('Timetable slot not found');
    await slot.deleteOne();
  }
}
