import bcrypt from 'bcryptjs';
import { School } from '../modules/schools/school.model.js';
import { User } from '../modules/users/user.model.js';
import { Class } from '../modules/academics/class.model.js';
import { Section } from '../modules/academics/section.model.js';
import { Student } from '../modules/students/student.model.js';
import { Parent } from '../modules/parents/parent.model.js';
import { Bus, Driver, Route, TransportAssignment } from '../modules/transport/transport.model.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../constants/roles.js';
import { logger } from '../config/logger.js';

export const seedDatabase = async () => {
  logger.info('Running database seed check...');

  try {
    const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Ensure Super Admin exists with correct password
    await User.findOneAndUpdate(
      { email: 'superadmin@erp.com' },
      {
        $set: {
          name: 'Platform Super Admin',
          email: 'superadmin@erp.com',
          passwordHash: defaultPasswordHash,
          role: ROLES.SUPER_ADMIN,
          permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
          status: 'ACTIVE',
          phone: '+91 98765 43210',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logger.info('Super Admin ready: superadmin@erp.com / Admin@123');

    // 2. Demo School A: Green Valley Academy
    let schoolA = await School.findOne({ code: 'GVA-101' });
    if (!schoolA) {
      schoolA = await School.create({
        name: 'Green Valley Academy',
        code: 'GVA-101',
        slug: 'greenvalley',
        email: 'contact@greenvalley.edu',
        phone: '+91 11 2345 6789',
        address: '42 Orchid Boulevard, Sector 14',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        academicYear: '2026-2027',
        status: 'ACTIVE',
        planId: 'enterprise',
        settings: {
          theme: 'emerald',
          attendanceType: 'biometric_and_manual',
        },
      });
    }

    // School A Admin
    await User.findOneAndUpdate(
      { email: 'admin@greenvalley.edu' },
      {
        $set: {
          schoolId: schoolA._id,
          name: 'Dr. Rajesh Sharma',
          email: 'admin@greenvalley.edu',
          passwordHash: defaultPasswordHash,
          role: ROLES.SCHOOL_ADMIN,
          permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
          status: 'ACTIVE',
          phone: '+91 98111 22334',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // School A Teacher Demo
    await User.findOneAndUpdate(
      { email: 'teacher@greenvalley.edu' },
      {
        $set: {
          schoolId: schoolA._id,
          name: 'Pooja Verma',
          email: 'teacher@greenvalley.edu',
          passwordHash: defaultPasswordHash,
          role: ROLES.TEACHER,
          permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER,
          status: 'ACTIVE',
          phone: '+91 98111 55667',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info('School A ready: Green Valley Academy (admin@greenvalley.edu / Admin@123)');

    // 3. Demo School B: Horizon International School
    let schoolB = await School.findOne({ code: 'HIS-202' });
    if (!schoolB) {
      schoolB = await School.create({
        name: 'Horizon International School',
        code: 'HIS-202',
        slug: 'horizon',
        email: 'contact@horizon.edu',
        phone: '+91 22 8765 4321',
        address: '108 Palm Avenue, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        academicYear: '2026-2027',
        status: 'ACTIVE',
        planId: 'pro',
        settings: {
          theme: 'indigo',
          attendanceType: 'manual',
        },
      });
    }

    // School B Admin
    await User.findOneAndUpdate(
      { email: 'admin@horizon.edu' },
      {
        $set: {
          schoolId: schoolB._id,
          name: 'Meera Deshmukh',
          email: 'admin@horizon.edu',
          passwordHash: defaultPasswordHash,
          role: ROLES.SCHOOL_ADMIN,
          permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
          status: 'ACTIVE',
          phone: '+91 98222 33445',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info('School B ready: Horizon International School (admin@horizon.edu / Admin@123)');

    // Demo Classes & Sections for School A
    try {
      let class5 = await Class.findOne({ schoolId: schoolA._id, name: 'Class 5' });
      if (!class5) {
        class5 = await Class.create({
          schoolId: schoolA._id,
          name: 'Class 5',
          order: 5,
        });
      }

      let secA = await Section.findOne({ schoolId: schoolA._id, classId: class5._id, name: 'A' });
      if (!secA) {
        secA = await Section.create({
          schoolId: schoolA._id,
          classId: class5._id,
          name: 'A',
          capacity: 35,
        });
      }

      let secB = await Section.findOne({ schoolId: schoolA._id, classId: class5._id, name: 'B' });
      if (!secB) {
        await Section.create({
          schoolId: schoolA._id,
          classId: class5._id,
          name: 'B',
          capacity: 35,
        });
      }

      // Demo Parent
      let parent1 = await Parent.findOne({ schoolId: schoolA._id, email: 'ramesh.sharma@example.com' });
      if (!parent1) {
        parent1 = await Parent.create({
          schoolId: schoolA._id,
          firstName: 'Ramesh',
          lastName: 'Sharma',
          email: 'ramesh.sharma@example.com',
          phone: '+91 98765 11223',
          relation: 'FATHER',
          occupation: 'Software Engineer',
          address: 'B-12 Green Park, Gurugram',
          children: [],
        });
      }

      // Demo Student
      let student1 = await Student.findOne({ schoolId: schoolA._id, admissionNumber: 'GVA-2026-001' });
      if (!student1) {
        student1 = await Student.create({
          schoolId: schoolA._id,
          admissionNumber: 'GVA-2026-001',
          rollNumber: '01',
          firstName: 'Aarav',
          lastName: 'Sharma',
          gender: 'MALE',
          dateOfBirth: new Date('2015-05-14'),
          bloodGroup: 'B+',
          email: 'aarav.sharma@example.com',
          phone: '+91 98765 11223',
          address: 'B-12 Green Park, Gurugram',
          classId: class5._id,
          sectionId: secA._id,
          academicYear: '2026-2027',
          parentId: parent1._id,
          status: 'ACTIVE',
        });

        if (!parent1.children.includes(student1._id as any)) {
          parent1.children.push(student1._id as any);
          await parent1.save();
        }
      }

      // Demo Transport
      let driver1 = await Driver.findOne({ schoolId: schoolA._id, phone: '+91 98111 22334' });
      if (!driver1) {
        driver1 = await Driver.create({
          schoolId: schoolA._id,
          name: 'Ramesh Singh',
          phone: '+91 98111 22334',
          licenseNumber: 'DL-0420180098765',
          status: 'ACTIVE',
        });
      }

      let bus1 = await Bus.findOne({ schoolId: schoolA._id, busNumber: 'BUS-01' });
      if (!bus1) {
        bus1 = await Bus.create({
          schoolId: schoolA._id,
          busNumber: 'BUS-01',
          registrationNumber: 'HR-26-CV-1001',
          capacity: 35,
          model: 'Tata Starbus 35S',
          driverId: driver1._id,
          status: 'ACTIVE',
          currentLocation: {
            lat: 28.4595,
            lng: 77.0266,
            speed: 38,
            heading: 145,
            updatedAt: new Date(),
          },
        });
        await Driver.findByIdAndUpdate(driver1._id, { assignedBusId: bus1._id });
      }

      let route1 = await Route.findOne({ schoolId: schoolA._id, name: 'Route 1 - North City Express' });
      if (!route1) {
        route1 = await Route.create({
          schoolId: schoolA._id,
          name: 'Route 1 - North City Express',
          busId: bus1._id,
          status: 'ACTIVE',
          stops: [
            { stopName: 'Campus Main Gate', pickupTime: '07:20 AM', dropTime: '03:45 PM', order: 1, lat: 28.4595, lng: 77.0266 },
            { stopName: 'Sector 14 Market', pickupTime: '07:35 AM', dropTime: '03:30 PM', order: 2, lat: 28.4720, lng: 77.0450 },
            { stopName: 'Orchid Boulevard Stop', pickupTime: '07:50 AM', dropTime: '03:15 PM', order: 3, lat: 28.4890, lng: 77.0620 },
          ],
        });
      }

      let assignment = await TransportAssignment.findOne({ schoolId: schoolA._id, studentId: student1._id });
      if (!assignment) {
        await TransportAssignment.create({
          schoolId: schoolA._id,
          studentId: student1._id,
          busId: bus1._id,
          routeId: route1._id,
          stopName: 'Orchid Boulevard Stop',
          pickupTime: '07:50 AM',
          dropTime: '03:15 PM',
          status: 'ACTIVE',
        });
      }
    } catch (subErr) {
      logger.warn('Non-critical demo relation seeding note:', subErr);
    }

    logger.info('Database seeding & verification completed successfully.');
  } catch (error) {
    logger.error('Database seed error:', error);
  }
};

// If run directly via CLI (npm run seed)
const isDirectRun = process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js');
if (isDirectRun) {
  (async () => {
    const { connectDatabase, disconnectDatabase } = await import('../config/database.js');
    await connectDatabase();
    await seedDatabase();
    await disconnectDatabase();
    process.exit(0);
  })().catch((err) => {
    logger.error('Seed execution error:', err);
    process.exit(1);
  });
}
