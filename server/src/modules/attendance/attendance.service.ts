import { Attendance, AttendanceStatus } from './attendance.model.js';
import { BiometricLog } from './biometricLog.model.js';
import { Student } from '../students/student.model.js';
import { Staff } from '../staff/staff.model.js';
import { BadRequestError } from '../../utils/appError.js';
import mongoose from 'mongoose';

export class AttendanceService {
  // ================= 1. Get Class Attendance Sheet =================
  static async getClassAttendanceSheet(
    schoolId: string,
    params: { classId: string; sectionId?: string; date: string }
  ) {
    const { classId, sectionId, date } = params;
    if (!classId || !date) {
      throw new BadRequestError('Class and Date are required parameters');
    }

    const studentFilter: any = { schoolId, classId, status: 'ACTIVE' };
    if (sectionId) studentFilter.sectionId = sectionId;

    const students = await Student.find(studentFilter)
      .select('firstName lastName admissionNumber rollNumber photo classId sectionId')
      .populate('sectionId', 'name')
      .sort({ rollNumber: 1, firstName: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // Fetch existing attendance records for this date
    const attendanceRecords = await Attendance.find({
      schoolId,
      targetType: 'STUDENT',
      date,
      studentId: { $in: studentIds },
    }).lean();

    const attendanceMap = new Map(attendanceRecords.map((a) => [a.studentId?.toString(), a]));

    return students.map((s) => {
      const record = attendanceMap.get(s._id.toString());
      return {
        student: s,
        attendanceId: record ? record._id : null,
        status: record ? record.status : 'PRESENT', // default to PRESENT if unmarked
        remarks: record ? record.remarks : '',
        source: record ? record.source : 'MANUAL',
        checkInTime: record ? record.checkInTime : null,
        isMarked: !!record,
      };
    });
  }

  // ================= 2. Mark Bulk Student Attendance =================
  static async markBulkStudentAttendance(
    schoolId: string,
    data: {
      date: string;
      classId: string;
      sectionId?: string;
      records: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }>;
    },
    markedBy?: string
  ) {
    const { date, classId, sectionId, records } = data;
    if (!records || records.length === 0) {
      throw new BadRequestError('No attendance records supplied');
    }

    const operations = records.map((r) => ({
      updateOne: {
        filter: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          targetType: 'STUDENT',
          studentId: new mongoose.Types.ObjectId(r.studentId),
          date,
        },
        update: {
          $set: {
            classId: new mongoose.Types.ObjectId(classId),
            sectionId: sectionId ? new mongoose.Types.ObjectId(sectionId) : null,
            status: r.status,
            remarks: r.remarks || '',
            source: 'MANUAL' as const,
            markedBy: markedBy ? new mongoose.Types.ObjectId(markedBy) : null,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(operations as any);
    return {
      date,
      totalMarked: records.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  // ================= 3. Get Staff Attendance Sheet =================
  static async getStaffAttendanceSheet(schoolId: string, date: string) {
    const staffList = await Staff.find({ schoolId, status: 'ACTIVE' })
      .select('firstName lastName employeeId designation department photo email phone')
      .sort({ firstName: 1 })
      .lean();

    const staffIds = staffList.map((s) => s._id);

    const records = await Attendance.find({
      schoolId,
      targetType: 'STAFF',
      date,
      staffId: { $in: staffIds },
    }).lean();

    const recordMap = new Map(records.map((r) => [r.staffId?.toString(), r]));

    return staffList.map((st) => {
      const record = recordMap.get(st._id.toString());
      return {
        staff: st,
        attendanceId: record ? record._id : null,
        status: record ? record.status : 'PRESENT',
        remarks: record ? record.remarks : '',
        checkInTime: record ? record.checkInTime : null,
        checkOutTime: record ? record.checkOutTime : null,
        source: record ? record.source : 'MANUAL',
        isMarked: !!record,
      };
    });
  }

  // ================= 4. Mark Bulk Staff Attendance =================
  static async markBulkStaffAttendance(
    schoolId: string,
    data: {
      date: string;
      records: Array<{
        staffId: string;
        status: AttendanceStatus;
        remarks?: string;
        checkInTime?: string;
        checkOutTime?: string;
      }>;
    },
    markedBy?: string
  ) {
    const { date, records } = data;

    const operations = records.map((r) => ({
      updateOne: {
        filter: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          targetType: 'STAFF',
          staffId: new mongoose.Types.ObjectId(r.staffId),
          date,
        },
        update: {
          $set: {
            status: r.status,
            remarks: r.remarks || '',
            checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
            checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
            source: 'MANUAL' as const,
            markedBy: markedBy ? new mongoose.Types.ObjectId(markedBy) : null,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(operations as any);
    return {
      date,
      totalMarked: records.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  // ================= 5. Monthly Class / School Attendance Summary =================
  static async getMonthlyAttendanceSummary(
    schoolId: string,
    params: { yearMonth: string; classId?: string }
  ) {
    const { yearMonth, classId } = params; // YYYY-MM
    const dateRegex = new RegExp(`^${yearMonth}`);

    const filter: any = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      targetType: 'STUDENT',
      date: dateRegex,
    };
    if (classId) {
      filter.classId = new mongoose.Types.ObjectId(classId);
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDaysRecorded = stats.reduce((acc, curr) => acc + curr.count, 0);
    const presentCount =
      (stats.find((s) => s._id === 'PRESENT')?.count || 0) +
      (stats.find((s) => s._id === 'LATE')?.count || 0) +
      (stats.find((s) => s._id === 'HALF_DAY')?.count || 0) * 0.5;

    const percentage = totalDaysRecorded > 0 ? ((presentCount / totalDaysRecorded) * 100).toFixed(1) : '100';

    return {
      yearMonth,
      totalDaysRecorded,
      attendancePercentage: Number(percentage),
      breakdown: stats.reduce((acc: any, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
    };
  }

  // ================= 6. Biometric Punch Webhook Ingestion =================
  static async ingestBiometricPunch(
    schoolId: string,
    data: {
      deviceId: string;
      identifier: string;
      eventType: 'CHECK_IN' | 'CHECK_OUT';
      timestamp?: string;
      rawEventId: string;
    }
  ) {
    const punchTime = data.timestamp ? new Date(data.timestamp) : new Date();
    const dateStr = punchTime.toISOString().split('T')[0];

    // Idempotency check via rawEventId
    const existingLog = await BiometricLog.findOne({ schoolId, rawEventId: data.rawEventId });
    if (existingLog) {
      return { status: 'DUPLICATE_IGNORED', log: existingLog };
    }

    // Try finding staff with employeeId
    const staff = await Staff.findOne({ schoolId, employeeId: data.identifier.toUpperCase() });
    if (staff) {
      const updateFields: any = {
        source: 'BIOMETRIC',
      };
      if (data.eventType === 'CHECK_IN') {
        updateFields.checkInTime = punchTime;
        updateFields.status = 'PRESENT';
      } else {
        updateFields.checkOutTime = punchTime;
      }

      await Attendance.findOneAndUpdate(
        {
          schoolId,
          targetType: 'STAFF',
          staffId: staff._id,
          date: dateStr,
        },
        { $set: updateFields },
        { upsert: true, new: true }
      );

      const log = await BiometricLog.create({
        schoolId,
        deviceId: data.deviceId,
        identifier: data.identifier.toUpperCase(),
        eventType: data.eventType,
        timestamp: punchTime,
        rawEventId: data.rawEventId,
        processed: true,
        mappedTargetType: 'STAFF',
        mappedEntityId: staff._id,
      });

      return { status: 'PROCESSED_STAFF', entity: `${staff.firstName} ${staff.lastName}`, log };
    }

    // Try finding student with admissionNumber
    const student = await Student.findOne({ schoolId, admissionNumber: data.identifier.toUpperCase() });
    if (student) {
      await Attendance.findOneAndUpdate(
        {
          schoolId,
          targetType: 'STUDENT',
          studentId: student._id,
          date: dateStr,
        },
        {
          $set: {
            classId: student.classId,
            sectionId: student.sectionId,
            status: 'PRESENT',
            checkInTime: punchTime,
            source: 'BIOMETRIC',
          },
        },
        { upsert: true, new: true }
      );

      const log = await BiometricLog.create({
        schoolId,
        deviceId: data.deviceId,
        identifier: data.identifier.toUpperCase(),
        eventType: data.eventType,
        timestamp: punchTime,
        rawEventId: data.rawEventId,
        processed: true,
        mappedTargetType: 'STUDENT',
        mappedEntityId: student._id,
      });

      return { status: 'PROCESSED_STUDENT', entity: `${student.firstName} ${student.lastName}`, log };
    }

    // Unmapped punch log
    const log = await BiometricLog.create({
      schoolId,
      deviceId: data.deviceId,
      identifier: data.identifier.toUpperCase(),
      eventType: data.eventType,
      timestamp: punchTime,
      rawEventId: data.rawEventId,
      processed: false,
      errorMessage: `Identifier '${data.identifier}' not found among staff or students`,
    });

    return { status: 'UNMAPPED_IDENTIFIER', log };
  }

  // ================= 7. Biometric Logs List =================
  static async listBiometricLogs(schoolId: string, limit = 50) {
    return BiometricLog.find({ schoolId }).sort({ timestamp: -1 }).limit(limit).lean();
  }
}
