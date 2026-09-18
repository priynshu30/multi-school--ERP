// ============================================================================
// Multi-School Cloud ERP - Mock Data Engine & In-Browser Persistent Store
// Provides instant full-featured demo data and CRUD operations for all modules
// ============================================================================

export interface MockStore {
  schools: any[];
  classes: any[];
  sections: any[];
  subjects: any[];
  academicYears: any[];
  students: any[];
  teachers: any[];
  staff: any[];
  parents: any[];
  invoices: any[];
  feeStructures: any[];
  exams: any[];
  examSchedules: any[];
  marks: any[];
  timetableSlots: any[];
  buses: any[];
  drivers: any[];
  routes: any[];
  transportAssignments: any[];
  notices: any[];
  homework: any[];
  users: any[];
  auditLogs: any[];
  attendanceRecords: any[];
}

const STORAGE_KEY = 'school_erp_mock_store_v1';

// Initial pre-seeded demo dataset
const getInitialStore = (): MockStore => {
  const schoolAId = 'school-gva-001';

  const classes = [
    { _id: 'class-001', schoolId: schoolAId, name: 'Class 5', order: 5 },
    { _id: 'class-002', schoolId: schoolAId, name: 'Class 6', order: 6 },
    { _id: 'class-003', schoolId: schoolAId, name: 'Class 7', order: 7 },
    { _id: 'class-004', schoolId: schoolAId, name: 'Class 8', order: 8 },
    { _id: 'class-005', schoolId: schoolAId, name: 'Class 9', order: 9 },
    { _id: 'class-006', schoolId: schoolAId, name: 'Class 10', order: 10 },
  ];

  const sections = [
    { _id: 'sec-001', schoolId: schoolAId, classId: 'class-001', name: 'A', capacity: 35, classTeacherId: 'teacher-001' },
    { _id: 'sec-002', schoolId: schoolAId, classId: 'class-001', name: 'B', capacity: 35, classTeacherId: 'teacher-002' },
    { _id: 'sec-003', schoolId: schoolAId, classId: 'class-002', name: 'A', capacity: 35, classTeacherId: 'teacher-003' },
    { _id: 'sec-004', schoolId: schoolAId, classId: 'class-006', name: 'A', capacity: 40, classTeacherId: 'teacher-001' },
  ];

  const subjects = [
    { _id: 'sub-001', schoolId: schoolAId, classId: 'class-001', name: 'Mathematics', code: 'MATH-5', teacherId: 'teacher-001', isOptional: false },
    { _id: 'sub-002', schoolId: schoolAId, classId: 'class-001', name: 'General Science', code: 'SCI-5', teacherId: 'teacher-002', isOptional: false },
    { _id: 'sub-003', schoolId: schoolAId, classId: 'class-001', name: 'English Literature', code: 'ENG-5', teacherId: 'teacher-003', isOptional: false },
    { _id: 'sub-004', schoolId: schoolAId, classId: 'class-001', name: 'Computer Applications', code: 'CS-5', teacherId: 'teacher-004', isOptional: true },
    { _id: 'sub-005', schoolId: schoolAId, classId: 'class-002', name: 'Mathematics', code: 'MATH-6', teacherId: 'teacher-001', isOptional: false },
  ];

  const academicYears = [
    { _id: 'ay-2026', schoolId: schoolAId, name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31', isCurrent: true },
    { _id: 'ay-2025', schoolId: schoolAId, name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
  ];

  const parents = [
    {
      _id: 'parent-001',
      schoolId: schoolAId,
      firstName: 'Ramesh',
      lastName: 'Sharma',
      email: 'ramesh.sharma@example.com',
      phone: '+91 98765 11223',
      alternatePhone: '+91 98765 11224',
      relation: 'FATHER',
      occupation: 'Senior Software Engineer',
      address: 'B-12 Green Park, Sector 14, Gurugram',
      children: [{ _id: 'student-001', firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'GVA-2026-001' }],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'parent-002',
      schoolId: schoolAId,
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@example.com',
      phone: '+91 98111 44556',
      relation: 'MOTHER',
      occupation: 'Architect',
      address: 'House 84, DLF Phase 2, Gurugram',
      children: [{ _id: 'student-002', firstName: 'Ananya', lastName: 'Patel', admissionNumber: 'GVA-2026-002' }],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  const students = [
    {
      _id: 'student-001',
      schoolId: schoolAId,
      admissionNumber: 'GVA-2026-001',
      rollNumber: '01',
      firstName: 'Aarav',
      lastName: 'Sharma',
      gender: 'MALE',
      dateOfBirth: '2015-05-14',
      bloodGroup: 'B+',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 11223',
      address: 'B-12 Green Park, Gurugram',
      classId: { _id: 'class-001', name: 'Class 5' },
      sectionId: { _id: 'sec-001', name: 'A' },
      academicYear: '2026-2027',
      parentId: { _id: 'parent-001', firstName: 'Ramesh', lastName: 'Sharma', phone: '+91 98765 11223', email: 'ramesh.sharma@example.com' },
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'student-002',
      schoolId: schoolAId,
      admissionNumber: 'GVA-2026-002',
      rollNumber: '02',
      firstName: 'Ananya',
      lastName: 'Patel',
      gender: 'FEMALE',
      dateOfBirth: '2015-08-22',
      bloodGroup: 'O+',
      email: 'ananya.patel@example.com',
      phone: '+91 98111 44556',
      address: 'House 84, DLF Phase 2, Gurugram',
      classId: { _id: 'class-001', name: 'Class 5' },
      sectionId: { _id: 'sec-001', name: 'A' },
      academicYear: '2026-2027',
      parentId: { _id: 'parent-002', firstName: 'Priya', lastName: 'Patel', phone: '+91 98111 44556', email: 'priya.patel@example.com' },
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'student-003',
      schoolId: schoolAId,
      admissionNumber: 'GVA-2026-003',
      rollNumber: '03',
      firstName: 'Rohan',
      lastName: 'Verma',
      gender: 'MALE',
      dateOfBirth: '2014-11-10',
      bloodGroup: 'A+',
      email: 'rohan.verma@example.com',
      phone: '+91 98333 77889',
      address: 'Sector 56, Golf Course Ext., Gurugram',
      classId: { _id: 'class-002', name: 'Class 6' },
      sectionId: { _id: 'sec-003', name: 'A' },
      academicYear: '2026-2027',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  const teachers = [
    {
      _id: 'teacher-001',
      schoolId: schoolAId,
      employeeId: 'EMP-T-001',
      firstName: 'Pooja',
      lastName: 'Verma',
      email: 'teacher@greenvalley.edu',
      phone: '+91 98111 55667',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      specialization: 'Higher Mathematics',
      joinDate: '2022-06-15',
      joiningDate: '2022-06-15',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'teacher-002',
      schoolId: schoolAId,
      employeeId: 'EMP-T-002',
      firstName: 'Vikram',
      lastName: 'Malhotra',
      email: 'vikram.science@greenvalley.edu',
      phone: '+91 98222 66778',
      qualification: 'M.Sc. Physics, B.Ed.',
      specialization: 'Physics & Applied Sciences',
      joinDate: '2021-08-01',
      joiningDate: '2021-08-01',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'teacher-003',
      schoolId: schoolAId,
      employeeId: 'EMP-T-003',
      firstName: 'Sneha',
      lastName: 'Kulkarni',
      email: 'sneha.english@greenvalley.edu',
      phone: '+91 98444 88990',
      qualification: 'M.A. English Literature, B.Ed.',
      specialization: 'English & Creative Writing',
      joinDate: '2023-01-10',
      joiningDate: '2023-01-10',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'teacher-004',
      schoolId: schoolAId,
      employeeId: 'EMP-T-004',
      firstName: 'Arun',
      lastName: 'Nair',
      email: 'arun.cs@greenvalley.edu',
      phone: '+91 98555 11223',
      qualification: 'MCA, B.Sc. Computer Science',
      specialization: 'Computer Science & AI',
      joinDate: '2023-04-01',
      joiningDate: '2023-04-01',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  const staff = [
    {
      _id: 'staff-001',
      schoolId: schoolAId,
      employeeId: 'EMP-S-001',
      firstName: 'Sunil',
      lastName: 'Mehta',
      email: 'sunil.finance@greenvalley.edu',
      phone: '+91 98111 99887',
      designation: 'Senior Accountant',
      department: 'Finance & Accounts',
      joinDate: '2020-03-01',
      joiningDate: '2020-03-01',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'staff-002',
      schoolId: schoolAId,
      employeeId: 'EMP-S-002',
      firstName: 'Rekha',
      lastName: 'Nair',
      email: 'rekha.library@greenvalley.edu',
      phone: '+91 98222 33441',
      designation: 'Head Librarian',
      department: 'Library',
      joinDate: '2021-07-15',
      joiningDate: '2021-07-15',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'staff-003',
      schoolId: schoolAId,
      employeeId: 'EMP-S-003',
      firstName: 'Manoj',
      lastName: 'Chauhan',
      email: 'manoj.it@greenvalley.edu',
      phone: '+91 98333 44552',
      designation: 'IT Systems Administrator',
      department: 'IT Support',
      joinDate: '2022-11-01',
      joiningDate: '2022-11-01',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  const drivers = [
    {
      _id: 'driver-001',
      schoolId: schoolAId,
      name: 'Ramesh Singh',
      phone: '+91 98111 22334',
      licenseNumber: 'DL-0420180098765',
      status: 'ACTIVE',
    },
    {
      _id: 'driver-002',
      schoolId: schoolAId,
      name: 'Suresh Yadav',
      phone: '+91 98222 55667',
      licenseNumber: 'HR-2620190012345',
      status: 'ACTIVE',
    },
  ];

  const buses = [
    {
      _id: 'bus-001',
      schoolId: schoolAId,
      busNumber: 'BUS-01',
      registrationNumber: 'HR-26-CV-1001',
      capacity: 35,
      model: 'Tata Starbus 35S',
      driverId: { _id: 'driver-001', name: 'Ramesh Singh', phone: '+91 98111 22334', status: 'ACTIVE' },
      status: 'ACTIVE',
      currentLocation: {
        lat: 28.4595,
        lng: 77.0266,
        speed: 36,
        heading: 145,
        updatedAt: new Date().toISOString(),
      },
    },
    {
      _id: 'bus-002',
      schoolId: schoolAId,
      busNumber: 'BUS-02',
      registrationNumber: 'HR-26-CV-1002',
      capacity: 40,
      model: 'Ashok Leyland Sunshine',
      driverId: { _id: 'driver-002', name: 'Suresh Yadav', phone: '+91 98222 55667', status: 'ACTIVE' },
      status: 'ACTIVE',
      currentLocation: {
        lat: 28.472,
        lng: 77.045,
        speed: 28,
        heading: 80,
        updatedAt: new Date().toISOString(),
      },
    },
  ];

  const routes = [
    {
      _id: 'route-001',
      schoolId: schoolAId,
      name: 'Route 1 - North City Express',
      busId: { _id: 'bus-001', busNumber: 'BUS-01', driverId: { name: 'Ramesh Singh', phone: '+91 98111 22334' } },
      status: 'ACTIVE',
      stops: [
        { stopName: 'Campus Main Gate', pickupTime: '07:20 AM', dropTime: '03:45 PM', order: 1 },
        { stopName: 'Sector 14 Market', pickupTime: '07:35 AM', dropTime: '03:30 PM', order: 2 },
        { stopName: 'Orchid Boulevard Stop', pickupTime: '07:50 AM', dropTime: '03:15 PM', order: 3 },
      ],
    },
    {
      _id: 'route-002',
      schoolId: schoolAId,
      name: 'Route 2 - DLF & Golf Course Hub',
      busId: { _id: 'bus-002', busNumber: 'BUS-02', driverId: { name: 'Suresh Yadav', phone: '+91 98222 55667' } },
      status: 'ACTIVE',
      stops: [
        { stopName: 'Campus Main Gate', pickupTime: '07:15 AM', dropTime: '03:50 PM', order: 1 },
        { stopName: 'DLF Phase 1 Metro', pickupTime: '07:35 AM', dropTime: '03:25 PM', order: 2 },
        { stopName: 'Sector 54 Rapid Metro', pickupTime: '07:55 AM', dropTime: '03:10 PM', order: 3 },
      ],
    },
  ];

  const transportAssignments = [
    {
      _id: 'ta-001',
      schoolId: schoolAId,
      studentId: { _id: 'student-001', firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'GVA-2026-001' },
      busId: { _id: 'bus-001', busNumber: 'BUS-01', registrationNumber: 'HR-26-CV-1001' },
      routeId: { _id: 'route-001', name: 'Route 1 - North City Express' },
      stopName: 'Orchid Boulevard Stop',
      pickupTime: '07:50 AM',
      dropTime: '03:15 PM',
      status: 'ACTIVE',
    },
  ];

  const feeStructures = [
    {
      _id: 'fs-001',
      schoolId: schoolAId,
      name: 'Primary Wing Annual Fee (Class 5)',
      academicYear: '2026-2027',
      classId: 'class-001',
      totalAmount: 18500,
      components: [
        { name: 'Tuition Fee (Term 1)', amount: 12000, frequency: 'TERMLY' },
        { name: 'Computer & Smart Lab', amount: 3500, frequency: 'TERMLY' },
        { name: 'Library & Activity Fund', amount: 3000, frequency: 'ANNUAL' },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const invoices = [
    {
      _id: 'inv-001',
      schoolId: schoolAId,
      invoiceNumber: 'INV-2026-001',
      title: 'Term 1 Tuition & Activity Fee',
      studentId: { _id: 'student-001', firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'GVA-2026-001' },
      classId: { name: 'Class 5' },
      dueDate: '2026-04-30',
      totalAmount: 18500,
      paidAmount: 18500,
      balanceAmount: 0,
      status: 'PAID',
      createdAt: new Date().toISOString(),
      payments: [
        {
          _id: 'pay-001',
          amount: 18500,
          paymentMethod: 'UPI',
          transactionReference: 'UPI-REF-998822',
          paidAt: new Date().toISOString(),
          notes: 'Paid via PhonePe',
        },
      ],
    },
    {
      _id: 'inv-002',
      schoolId: schoolAId,
      invoiceNumber: 'INV-2026-002',
      title: 'Term 1 Tuition & Activity Fee',
      studentId: { _id: 'student-002', firstName: 'Ananya', lastName: 'Patel', admissionNumber: 'GVA-2026-002' },
      classId: { name: 'Class 5' },
      dueDate: '2026-05-15',
      totalAmount: 18500,
      paidAmount: 10000,
      balanceAmount: 8500,
      status: 'PARTIAL',
      createdAt: new Date().toISOString(),
      payments: [
        {
          _id: 'pay-002',
          amount: 10000,
          paymentMethod: 'NET_BANKING',
          transactionReference: 'HDFC-TXN-445566',
          paidAt: new Date().toISOString(),
          notes: 'Part payment',
        },
      ],
    },
    {
      _id: 'inv-003',
      schoolId: schoolAId,
      invoiceNumber: 'INV-2026-003',
      title: 'Term 1 Tuition & Activity Fee',
      studentId: { _id: 'student-003', firstName: 'Rohan', lastName: 'Verma', admissionNumber: 'GVA-2026-003' },
      classId: { name: 'Class 6' },
      dueDate: '2026-04-25',
      totalAmount: 19500,
      paidAmount: 0,
      balanceAmount: 19500,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      payments: [],
    },
  ];

  const exams = [
    {
      _id: 'exam-001',
      schoolId: schoolAId,
      name: 'Term 1 Mid-Term Examination 2026',
      term: 'Term 1',
      academicYear: '2026-2027',
      startDate: '2026-09-15',
      endDate: '2026-09-26',
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'exam-002',
      schoolId: schoolAId,
      name: 'Unit Test 1 (Formative Assessment)',
      term: 'Term 1',
      academicYear: '2026-2027',
      startDate: '2026-05-10',
      endDate: '2026-05-16',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
  ];

  const examSchedules = [
    {
      _id: 'sched-001',
      schoolId: schoolAId,
      examId: 'exam-001',
      classId: { _id: 'class-001', name: 'Class 5' },
      subjectId: { _id: 'sub-001', name: 'Mathematics', code: 'MATH-5' },
      examDate: '2026-09-16',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      maxMarks: 100,
      passMarks: 35,
      room: 'Examination Hall 1',
    },
    {
      _id: 'sched-002',
      schoolId: schoolAId,
      examId: 'exam-001',
      classId: { _id: 'class-001', name: 'Class 5' },
      subjectId: { _id: 'sub-002', name: 'General Science', code: 'SCI-5' },
      examDate: '2026-09-18',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      maxMarks: 100,
      passMarks: 35,
      room: 'Examination Hall 1',
    },
  ];

  const marks = [
    {
      _id: 'mark-001',
      schoolId: schoolAId,
      examId: 'exam-001',
      studentId: 'student-001',
      subjectId: 'sub-001',
      marksObtained: 94,
      maxMarks: 100,
      grade: 'A+',
      remarks: 'Outstanding performance in problem solving',
    },
    {
      _id: 'mark-002',
      schoolId: schoolAId,
      examId: 'exam-001',
      studentId: 'student-002',
      subjectId: 'sub-001',
      marksObtained: 88,
      maxMarks: 100,
      grade: 'A',
      remarks: 'Very good grasp of concepts',
    },
  ];

  const timetableSlots = [
    {
      _id: 'tt-001',
      schoolId: schoolAId,
      classId: 'class-001',
      sectionId: 'sec-001',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '09:00 AM',
      endTime: '09:45 AM',
      subjectId: { _id: 'sub-001', name: 'Mathematics', code: 'MATH-5' },
      teacherId: { _id: 'teacher-001', firstName: 'Pooja', lastName: 'Verma' },
      room: 'Room 501',
    },
    {
      _id: 'tt-002',
      schoolId: schoolAId,
      classId: 'class-001',
      sectionId: 'sec-001',
      dayOfWeek: 'MONDAY',
      periodNumber: 2,
      startTime: '09:45 AM',
      endTime: '10:30 AM',
      subjectId: { _id: 'sub-002', name: 'General Science', code: 'SCI-5' },
      teacherId: { _id: 'teacher-002', firstName: 'Vikram', lastName: 'Malhotra' },
      room: 'Physics Lab 1',
    },
    {
      _id: 'tt-003',
      schoolId: schoolAId,
      classId: 'class-001',
      sectionId: 'sec-001',
      dayOfWeek: 'TUESDAY',
      periodNumber: 1,
      startTime: '09:00 AM',
      endTime: '09:45 AM',
      subjectId: { _id: 'sub-003', name: 'English Literature', code: 'ENG-5' },
      teacherId: { _id: 'teacher-003', firstName: 'Sneha', lastName: 'Kulkarni' },
      room: 'Room 501',
    },
  ];

  const notices = [
    {
      _id: 'not-001',
      schoolId: schoolAId,
      title: 'Annual Sports Day & Athletics Meet 2026',
      content:
        'Green Valley Academy is proud to announce the Annual Inter-House Sports Meet. All students are invited to register for track events, relay races, and long jump with their respective house captains.',
      audience: 'ALL',
      priority: 'HIGH',
      startDate: '2026-09-18',
      endDate: '2026-10-05',
      authorName: 'Dr. Rajesh Sharma',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'not-002',
      schoolId: schoolAId,
      title: 'Term 1 Mid-Term Examination Timetable Released',
      content:
        'The date sheet for Term 1 Mid-Term Examinations is now published. Please ensure all syllabus revisions and pending assignments are submitted by this Friday.',
      audience: 'STUDENTS',
      priority: 'URGENT',
      startDate: '2026-09-10',
      endDate: '2026-09-25',
      authorName: 'Academic Directorate',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'not-003',
      schoolId: schoolAId,
      title: 'Staff Academic Council Meeting',
      content:
        'All teaching faculty members are requested to assemble in the Central Conference Room at 3:45 PM for the Term 1 moderation review.',
      audience: 'TEACHERS',
      priority: 'NORMAL',
      startDate: '2026-09-19',
      endDate: '2026-09-20',
      authorName: 'Vice Principal Office',
      createdAt: new Date().toISOString(),
    },
  ];

  const homework = [
    {
      _id: 'hw-001',
      schoolId: schoolAId,
      title: 'Fractions & Mixed Numbers - Practice Exercise 4.2',
      description: 'Complete problems 1 through 15 from textbook page 78 in your homework notebook.',
      classId: { _id: 'class-001', name: 'Class 5' },
      subjectId: { _id: 'sub-001', name: 'Mathematics' },
      dueDate: '2026-09-22',
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'hw-002',
      schoolId: schoolAId,
      title: 'Plant Life Cycle & Photosynthesis Diagram',
      description: 'Draw and neatly label the stages of chloroplast light absorption and stomatal exchange.',
      classId: { _id: 'class-001', name: 'Class 5' },
      subjectId: { _id: 'sub-002', name: 'General Science' },
      dueDate: '2026-09-24',
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
    },
  ];

  const users = [
    {
      _id: 'user-001',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@greenvalley.edu',
      role: 'SCHOOL_ADMIN',
      schoolId: schoolAId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user-002',
      name: 'Pooja Verma',
      email: 'teacher@greenvalley.edu',
      role: 'TEACHER',
      schoolId: schoolAId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user-003',
      name: 'Sunil Mehta',
      email: 'sunil.finance@greenvalley.edu',
      role: 'STAFF',
      schoolId: schoolAId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  const schools = [
    {
      _id: schoolAId,
      name: 'Green Valley Academy',
      code: 'GVA-101',
      slug: 'greenvalley',
      email: 'contact@greenvalley.edu',
      phone: '+91 11 2345 6789',
      address: '42 Orchid Boulevard, Sector 14',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      currency: 'INR',
      planId: 'enterprise',
      status: 'ACTIVE',
      staffCount: 18,
      teacherCount: 24,
      studentCount: 320,
      createdAt: '2026-01-10T00:00:00.000Z',
    },
    {
      _id: 'school-his-002',
      name: 'Horizon International School',
      code: 'HIS-202',
      slug: 'horizon',
      email: 'contact@horizon.edu',
      phone: '+91 22 8765 4321',
      address: '108 Palm Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      currency: 'INR',
      planId: 'pro',
      status: 'ACTIVE',
      staffCount: 12,
      teacherCount: 16,
      studentCount: 210,
      createdAt: '2026-02-14T00:00:00.000Z',
    },
  ];

  const auditLogs = [
    {
      _id: 'audit-001',
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH',
      actorId: { name: 'Dr. Rajesh Sharma', email: 'admin@greenvalley.edu', role: 'SCHOOL_ADMIN' },
      schoolId: { name: 'Green Valley Academy', code: 'GVA-101' },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'audit-002',
      action: 'STUDENT_ADMISSION',
      resource: 'STUDENTS',
      actorId: { name: 'Dr. Rajesh Sharma', email: 'admin@greenvalley.edu', role: 'SCHOOL_ADMIN' },
      schoolId: { name: 'Green Valley Academy', code: 'GVA-101' },
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return {
    schools,
    classes,
    sections,
    subjects,
    academicYears,
    students,
    teachers,
    staff,
    parents,
    invoices,
    feeStructures,
    exams,
    examSchedules,
    marks,
    timetableSlots,
    buses,
    drivers,
    routes,
    transportAssignments,
    notices,
    homework,
    users,
    auditLogs,
    attendanceRecords: [],
  };
};

/** Load store from localStorage, or initialize with pre-seeded demo data */
export const getMockStore = (): MockStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse mock store, resetting to defaults', e);
  }
  const initial = getInitialStore();
  saveMockStore(initial);
  return initial;
};

/** Save store into localStorage */
export const saveMockStore = (store: MockStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save mock store', e);
  }
};

// ============================================================================
// Mock Request Router & Handler
// ============================================================================

export function handleMockApiRequest(config: {
  url?: string;
  method?: string;
  data?: any;
  params?: any;
}): { status: number; data: any } | null {
  const method = (config.method || 'get').toUpperCase();
  const rawUrl = config.url || '';
  // Normalize url: strip baseURL prefix if present
  let url = rawUrl.replace(/^\/api\/v1/, '');
  if (!url.startsWith('/')) url = '/' + url;

  const urlObj = new URL('http://localhost' + url);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  const getQuery = (param: string) => {
    return (config.params && config.params[param]) || searchParams.get(param) || '';
  };

  const parseBody = () => {
    if (typeof config.data === 'string') {
      try {
        return JSON.parse(config.data);
      } catch {
        return {};
      }
    }
    return config.data || {};
  };

  const store = getMockStore();

  // ──────────────────────────── 1. Auth ────────────────────────────
  if (pathname === '/auth/me') {
    const storedUser = localStorage.getItem('mockUser');
    const storedSchool = localStorage.getItem('mockSchool');
    return {
      status: 200,
      data: {
        success: true,
        data: {
          user: storedUser ? JSON.parse(storedUser) : store.users[0],
          school: storedSchool ? JSON.parse(storedSchool) : store.schools[0],
        },
      },
    };
  }

  // ──────────────────────────── 2. Schools ────────────────────────────
  if (pathname === '/schools/stats/platform') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          total: store.schools.length,
          active: store.schools.filter((s) => s.status === 'ACTIVE').length,
          suspended: store.schools.filter((s) => s.status === 'SUSPENDED').length,
          totalStudents: 530,
          totalTeachers: 40,
        },
      },
    };
  }

  if (pathname === '/schools/current/stats' || pathname === '/schools/current') {
    const school = store.schools[0];
    if (pathname === '/schools/current' && method === 'PUT') {
      const body = parseBody();
      Object.assign(school, body);
      saveMockStore(store);
      return { status: 200, data: { success: true, data: school } };
    }
    return {
      status: 200,
      data: {
        success: true,
        data: {
          ...school,
          totalStudents: store.students.length + 245,
          totalTeachers: store.teachers.length + 14,
          totalClasses: store.classes.length,
          todayAttendance: 92,
          teachersTrend: 5,
        },
      },
    };
  }

  if (pathname === '/schools' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    const status = getQuery('status');
    let list = [...store.schools];
    if (search) {
      list = list.filter((s) => s.name.toLowerCase().includes(search) || s.code.toLowerCase().includes(search));
    }
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/schools' && method === 'POST') {
    const body = parseBody();
    const newSchool = {
      _id: 'school-' + Date.now(),
      ...body,
      status: 'ACTIVE',
      staffCount: 0,
      teacherCount: 0,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };
    store.schools.push(newSchool);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newSchool } };
  }

  if (pathname.startsWith('/schools/') && pathname.endsWith('/suspend')) {
    const id = pathname.split('/')[2];
    const item = store.schools.find((s) => s._id === id);
    if (item) item.status = 'SUSPENDED';
    saveMockStore(store);
    return { status: 200, data: { success: true, data: item } };
  }

  if (pathname.startsWith('/schools/') && pathname.endsWith('/activate')) {
    const id = pathname.split('/')[2];
    const item = store.schools.find((s) => s._id === id);
    if (item) item.status = 'ACTIVE';
    saveMockStore(store);
    return { status: 200, data: { success: true, data: item } };
  }

  // ──────────────────────────── 3. Students ────────────────────────────
  if (pathname === '/students/stats') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          totalStudents: store.students.length + 245,
          total: store.students.length + 245,
          totalClasses: store.classes.length,
          todayAttendance: 91,
          trend: 8,
          myClasses: 4,
        },
      },
    };
  }

  if (pathname === '/students' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    const status = getQuery('status');
    const classId = getQuery('classId');
    let list = [...store.students];
    if (search) {
      list = list.filter(
        (s) =>
          (s.firstName + ' ' + s.lastName).toLowerCase().includes(search) ||
          s.admissionNumber.toLowerCase().includes(search) ||
          (s.email && s.email.toLowerCase().includes(search))
      );
    }
    if (status) list = list.filter((s) => s.status === status);
    if (classId) list = list.filter((s) => (s.classId?._id || s.classId) === classId);

    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 20, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/students' && method === 'POST') {
    const body = parseBody();
    const targetClass = store.classes.find((c) => c._id === body.classId);
    const targetSection = store.sections.find((s) => s._id === body.sectionId);
    const targetParent = store.parents.find((p) => p._id === body.parentId);

    const newStudent = {
      _id: 'student-' + Date.now(),
      schoolId: 'school-gva-001',
      admissionNumber: body.admissionNumber || `GVA-2026-${String(store.students.length + 1).padStart(3, '0')}`,
      rollNumber: body.rollNumber || String(store.students.length + 1),
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender || 'MALE',
      dateOfBirth: body.dateOfBirth || '2015-01-01',
      bloodGroup: body.bloodGroup || 'B+',
      email: body.email,
      phone: body.phone,
      address: body.address,
      classId: targetClass ? { _id: targetClass._id, name: targetClass.name } : undefined,
      sectionId: targetSection ? { _id: targetSection._id, name: targetSection.name } : undefined,
      parentId: targetParent
        ? { _id: targetParent._id, firstName: targetParent.firstName, lastName: targetParent.lastName, phone: targetParent.phone, email: targetParent.email }
        : undefined,
      academicYear: body.academicYear || '2026-2027',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    store.students.unshift(newStudent);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newStudent } };
  }

  if (pathname.startsWith('/students/') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const body = parseBody();
    const idx = store.students.findIndex((s) => s._id === id);
    if (idx !== -1) {
      const targetClass = body.classId ? store.classes.find((c) => c._id === body.classId) : null;
      const targetSection = body.sectionId ? store.sections.find((s) => s._id === body.sectionId) : null;
      const updated = {
        ...store.students[idx],
        ...body,
        ...(targetClass ? { classId: { _id: targetClass._id, name: targetClass.name } } : {}),
        ...(targetSection ? { sectionId: { _id: targetSection._id, name: targetSection.name } } : {}),
      };
      store.students[idx] = updated;
      saveMockStore(store);
      return { status: 200, data: { success: true, data: updated } };
    }
    return { status: 404, data: { success: false, message: 'Student not found' } };
  }

  if (pathname.startsWith('/students/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.students = store.students.filter((s) => s._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Student deleted successfully' } };
  }

  // ──────────────────────────── 4. Teachers ────────────────────────────
  if (pathname === '/teachers' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    const status = getQuery('status');
    let list = [...store.teachers];
    if (search) {
      list = list.filter(
        (t) =>
          (t.firstName + ' ' + t.lastName).toLowerCase().includes(search) ||
          t.employeeId.toLowerCase().includes(search) ||
          t.email.toLowerCase().includes(search) ||
          (t.specialization && t.specialization.toLowerCase().includes(search))
      );
    }
    if (status) list = list.filter((t) => t.status === status);
    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/teachers' && method === 'POST') {
    const body = parseBody();
    const newTeacher = {
      _id: 'teacher-' + Date.now(),
      schoolId: 'school-gva-001',
      employeeId: body.employeeId || `EMP-T-${String(store.teachers.length + 1).padStart(3, '0')}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      qualification: body.qualification,
      specialization: body.specialization,
      joinDate: body.joiningDate || body.joinDate || new Date().toISOString().split('T')[0],
      joiningDate: body.joiningDate || body.joinDate || new Date().toISOString().split('T')[0],
      status: body.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    store.teachers.unshift(newTeacher);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newTeacher } };
  }

  if (pathname.startsWith('/teachers/') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const body = parseBody();
    const idx = store.teachers.findIndex((t) => t._id === id);
    if (idx !== -1) {
      store.teachers[idx] = { ...store.teachers[idx], ...body };
      saveMockStore(store);
      return { status: 200, data: { success: true, data: store.teachers[idx] } };
    }
    return { status: 404, data: { success: false, message: 'Teacher not found' } };
  }

  if (pathname.startsWith('/teachers/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.teachers = store.teachers.filter((t) => t._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Teacher deleted' } };
  }

  // ──────────────────────────── 5. Staff ────────────────────────────
  if (pathname === '/staff' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    const department = getQuery('department');
    const status = getQuery('status');
    let list = [...store.staff];
    if (search) {
      list = list.filter(
        (s) =>
          (s.firstName + ' ' + s.lastName).toLowerCase().includes(search) ||
          s.employeeId.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search)
      );
    }
    if (department) list = list.filter((s) => s.department === department);
    if (status) list = list.filter((s) => s.status === status);
    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/staff' && method === 'POST') {
    const body = parseBody();
    const newStaff = {
      _id: 'staff-' + Date.now(),
      schoolId: 'school-gva-001',
      employeeId: body.employeeId || `EMP-S-${String(store.staff.length + 1).padStart(3, '0')}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      designation: body.designation,
      department: body.department,
      joinDate: body.joiningDate || body.joinDate || new Date().toISOString().split('T')[0],
      joiningDate: body.joiningDate || body.joinDate || new Date().toISOString().split('T')[0],
      status: body.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    store.staff.unshift(newStaff);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newStaff } };
  }

  if (pathname.startsWith('/staff/') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const body = parseBody();
    const idx = store.staff.findIndex((s) => s._id === id);
    if (idx !== -1) {
      store.staff[idx] = { ...store.staff[idx], ...body };
      saveMockStore(store);
      return { status: 200, data: { success: true, data: store.staff[idx] } };
    }
    return { status: 404, data: { success: false, message: 'Staff member not found' } };
  }

  if (pathname.startsWith('/staff/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.staff = store.staff.filter((s) => s._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Staff deleted' } };
  }

  // ──────────────────────────── 6. Parents ────────────────────────────
  if (pathname === '/parents' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    let list = [...store.parents];
    if (search) {
      list = list.filter(
        (p) =>
          (p.firstName + ' ' + p.lastName).toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.phone.includes(search)
      );
    }
    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/parents' && method === 'POST') {
    const body = parseBody();
    const newParent = {
      _id: 'parent-' + Date.now(),
      schoolId: 'school-gva-001',
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      alternatePhone: body.alternatePhone,
      relation: body.relation || 'GUARDIAN',
      occupation: body.occupation,
      address: body.address,
      children: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    store.parents.unshift(newParent);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newParent } };
  }

  if (pathname.startsWith('/parents/') && pathname.endsWith('/children') && method === 'POST') {
    const id = pathname.split('/')[2];
    const body = parseBody();
    const parent = store.parents.find((p) => p._id === id);
    const student = store.students.find((s) => s._id === body.studentId);
    if (parent && student) {
      if (!parent.children) parent.children = [];
      if (!parent.children.some((c: any) => c._id === student._id)) {
        parent.children.push({
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
        });
        student.parentId = {
          _id: parent._id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phone: parent.phone,
          email: parent.email,
        };
        saveMockStore(store);
      }
      return { status: 200, data: { success: true, data: parent } };
    }
    return { status: 400, data: { success: false, message: 'Invalid parent or student' } };
  }

  if (pathname.startsWith('/parents/') && method === 'PATCH') {
    const id = pathname.split('/')[2];
    const body = parseBody();
    const idx = store.parents.findIndex((p) => p._id === id);
    if (idx !== -1) {
      store.parents[idx] = { ...store.parents[idx], ...body };
      saveMockStore(store);
      return { status: 200, data: { success: true, data: store.parents[idx] } };
    }
    return { status: 404, data: { success: false, message: 'Parent not found' } };
  }

  if (pathname.startsWith('/parents/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.parents = store.parents.filter((p) => p._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Parent deleted' } };
  }

  // ──────────────────────────── 7. Academics ────────────────────────────
  if (pathname === '/academics/classes') {
    if (method === 'GET') {
      const enriched = store.classes.map((c) => ({
        ...c,
        sections: store.sections.filter((sec) => sec.classId === c._id),
      }));
      return { status: 200, data: { success: true, data: enriched } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newClass = {
        _id: 'class-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        order: Number(body.order) || store.classes.length + 1,
      };
      store.classes.push(newClass);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newClass } };
    }
  }

  if (pathname.startsWith('/academics/classes/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.classes = store.classes.filter((c) => c._id !== id);
    store.sections = store.sections.filter((s) => s.classId !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Class deleted' } };
  }

  if (pathname === '/academics/sections') {
    if (method === 'GET') {
      const classId = getQuery('classId');
      let list = [...store.sections];
      if (classId) list = list.filter((s) => s.classId === classId);
      return { status: 200, data: { success: true, data: list } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newSec = {
        _id: 'sec-' + Date.now(),
        schoolId: 'school-gva-001',
        classId: body.classId,
        name: body.name,
        capacity: Number(body.capacity) || 40,
        classTeacherId: body.classTeacherId || undefined,
      };
      store.sections.push(newSec);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newSec } };
    }
  }

  if (pathname.startsWith('/academics/sections/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.sections = store.sections.filter((s) => s._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Section deleted' } };
  }

  if (pathname === '/academics/subjects') {
    if (method === 'GET') {
      const classId = getQuery('classId');
      let list = [...store.subjects];
      if (classId) list = list.filter((s) => s.classId === classId);
      return { status: 200, data: { success: true, data: list } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newSub = {
        _id: 'sub-' + Date.now(),
        schoolId: 'school-gva-001',
        classId: body.classId,
        name: body.name,
        code: body.code || body.name.substring(0, 4).toUpperCase(),
        teacherId: body.teacherId,
        isOptional: !!body.isOptional,
      };
      store.subjects.push(newSub);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newSub } };
    }
  }

  if (pathname.startsWith('/academics/subjects/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.subjects = store.subjects.filter((s) => s._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Subject deleted' } };
  }

  if (pathname === '/academics/years') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, data: store.academicYears } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newYear = {
        _id: 'ay-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        isCurrent: !!body.isCurrent,
      };
      if (newYear.isCurrent) {
        store.academicYears.forEach((y) => (y.isCurrent = false));
      }
      store.academicYears.unshift(newYear);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newYear } };
    }
  }

  if (pathname === '/academics/promote' && method === 'POST') {
    const body = parseBody();
    const targetClass = store.classes.find((c) => c._id === body.targetClassId);
    const targetSection = store.sections.find((s) => s._id === body.targetSectionId);

    if (body.studentIds && Array.isArray(body.studentIds)) {
      store.students.forEach((stu) => {
        if (body.studentIds.includes(stu._id)) {
          if (targetClass) stu.classId = { _id: targetClass._id, name: targetClass.name };
          if (targetSection) stu.sectionId = { _id: targetSection._id, name: targetSection.name };
          stu.academicYear = body.targetAcademicYear || '2026-2027';
        }
      });
      saveMockStore(store);
    }
    return {
      status: 200,
      data: { success: true, message: `Successfully promoted ${body.studentIds?.length || 0} students.` },
    };
  }

  // ──────────────────────────── 8. Attendance ────────────────────────────
  if (pathname === '/attendance/sheet') {
    const classId = getQuery('classId');
    const sectionId = getQuery('sectionId');
    const studentsInClass = store.students.filter(
      (s) => (s.classId?._id || s.classId) === classId && (!sectionId || (s.sectionId?._id || s.sectionId) === sectionId)
    );
    const roster = studentsInClass.map((s, idx) => ({
      _id: s._id,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber || String(idx + 1),
      firstName: s.firstName,
      lastName: s.lastName,
      status: idx % 8 === 0 ? 'ABSENT' : idx % 12 === 0 ? 'LATE' : 'PRESENT',
      remarks: '',
    }));
    return { status: 200, data: { success: true, data: roster } };
  }

  if (pathname === '/attendance/bulk' && method === 'POST') {
    const body = parseBody();
    return {
      status: 200,
      data: {
        success: true,
        message: `Roll call recorded for ${body.records?.length || 0} students.`,
      },
    };
  }

  if (pathname === '/attendance/staff/sheet') {
    const roster = store.staff.map((s, idx) => ({
      _id: s._id,
      employeeId: s.employeeId,
      name: `${s.firstName} ${s.lastName}`,
      department: s.department,
      status: idx === 2 ? 'ON_LEAVE' : 'PRESENT',
      inTime: '08:45 AM',
      outTime: '04:30 PM',
    }));
    return { status: 200, data: { success: true, data: roster } };
  }

  if (pathname === '/attendance/staff/bulk' && method === 'POST') {
    return { status: 200, data: { success: true, message: 'Staff attendance recorded successfully.' } };
  }

  if (pathname === '/attendance/summary') {
    const days = parseInt(getQuery('days')) || 7;
    const points = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      points.push({
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        date: d.toISOString().split('T')[0],
        rate: 85 + Math.floor(Math.sin(i) * 10),
      });
    }
    return { status: 200, data: { success: true, data: points } };
  }

  if (pathname === '/attendance/biometric/sync' && method === 'POST') {
    const body = parseBody();
    return {
      status: 200,
      data: {
        success: true,
        data: {
          recordedAt: new Date().toISOString(),
          employeeId: body.identifier || 'EMP-T-001',
          name: 'Pooja Verma',
          type: body.eventType || 'CHECK_IN',
          terminal: 'Gate 1 Biometric Terminal',
        },
      },
    };
  }

  // ──────────────────────────── 9. Fees ────────────────────────────
  if (pathname === '/fees/summary') {
    const totalBilled = store.invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const totalCollected = store.invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const pendingDues = totalBilled - totalCollected;
    const overdueCount = store.invoices.filter((i) => i.status === 'OVERDUE' || (i.status === 'PENDING' && new Date(i.dueDate) < new Date())).length;
    return {
      status: 200,
      data: {
        success: true,
        data: {
          totalBilled,
          totalCollected,
          pendingDues,
          overdueCount,
          collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
        },
      },
    };
  }

  if (pathname === '/fees/invoices' && method === 'GET') {
    const search = getQuery('search').toLowerCase();
    const status = getQuery('status');
    let list = [...store.invoices];
    if (search) {
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(search) ||
          inv.title.toLowerCase().includes(search) ||
          (inv.studentId &&
            `${inv.studentId.firstName} ${inv.studentId.lastName}`.toLowerCase().includes(search))
      );
    }
    if (status) list = list.filter((i) => i.status === status);
    return {
      status: 200,
      data: {
        success: true,
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
      },
    };
  }

  if (pathname === '/fees/structures') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, data: store.feeStructures } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const totalAmount = (body.components || []).reduce((acc: number, c: any) => acc + (Number(c.amount) || 0), 0);
      const newStruct = {
        _id: 'fs-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        academicYear: body.academicYear || '2026-2027',
        classId: body.classId,
        totalAmount,
        components: body.components || [],
        createdAt: new Date().toISOString(),
      };
      store.feeStructures.push(newStruct);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newStruct } };
    }
  }

  if (pathname === '/fees/invoices/generate' && method === 'POST') {
    const body = parseBody();
    const struct = store.feeStructures.find((s) => s._id === body.feeStructureId) || store.feeStructures[0];
    const amount = struct ? struct.totalAmount : 15000;
    const newInvoicesCount = store.students.length;

    store.students.forEach((stu, idx) => {
      store.invoices.push({
        _id: 'inv-' + Date.now() + '-' + idx,
        schoolId: 'school-gva-001',
        invoiceNumber: `INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`,
        title: body.title || 'Institutional Fee',
        studentId: {
          _id: stu._id,
          firstName: stu.firstName,
          lastName: stu.lastName,
          admissionNumber: stu.admissionNumber,
        },
        classId: stu.classId,
        dueDate: body.dueDate || '2026-06-30',
        totalAmount: amount,
        paidAmount: 0,
        balanceAmount: amount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        payments: [],
      });
    });
    saveMockStore(store);
    return {
      status: 200,
      data: { success: true, message: `Generated ${newInvoicesCount} invoices successfully!` },
    };
  }

  if (pathname === '/fees/payments' && method === 'POST') {
    const body = parseBody();
    const invoice = store.invoices.find((i) => i._id === body.invoiceId);
    if (invoice) {
      const payAmount = Number(body.amount) || 0;
      invoice.paidAmount = (invoice.paidAmount || 0) + payAmount;
      invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      invoice.status = invoice.balanceAmount === 0 ? 'PAID' : 'PARTIAL';
      if (!invoice.payments) invoice.payments = [];
      invoice.payments.push({
        _id: 'pay-' + Date.now(),
        amount: payAmount,
        paymentMethod: body.paymentMethod || 'CASH',
        transactionReference: body.transactionReference || 'REF-' + Date.now(),
        notes: body.notes,
        paidAt: new Date().toISOString(),
      });
      saveMockStore(store);
      return { status: 200, data: { success: true, data: invoice } };
    }
    return { status: 404, data: { success: false, message: 'Invoice not found' } };
  }

  // ──────────────────────────── 10. Exams ────────────────────────────
  if (pathname === '/exams') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, data: store.exams } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newExam = {
        _id: 'exam-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        term: body.term || 'Term 1',
        academicYear: body.academicYear || '2026-2027',
        startDate: body.startDate,
        endDate: body.endDate,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
      };
      store.exams.unshift(newExam);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newExam } };
    }
  }

  if (pathname === '/exams/schedules') {
    if (method === 'GET') {
      const examId = getQuery('examId');
      let list = [...store.examSchedules];
      if (examId) list = list.filter((s) => s.examId === examId);
      return { status: 200, data: { success: true, data: list } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const targetClass = store.classes.find((c) => c._id === body.classId);
      const targetSub = store.subjects.find((s) => s._id === body.subjectId);
      const newSched = {
        _id: 'sched-' + Date.now(),
        schoolId: 'school-gva-001',
        examId: body.examId,
        classId: targetClass ? { _id: targetClass._id, name: targetClass.name } : undefined,
        subjectId: targetSub ? { _id: targetSub._id, name: targetSub.name, code: targetSub.code } : undefined,
        examDate: body.examDate,
        startTime: body.startTime || '09:30 AM',
        endTime: body.endTime || '12:30 PM',
        maxMarks: Number(body.maxMarks) || 100,
        passMarks: Number(body.passMarks) || 35,
        room: body.room || 'Examination Hall',
      };
      store.examSchedules.push(newSched);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newSched } };
    }
  }

  if (pathname === '/exams/marks/bulk' && method === 'POST') {
    const body = parseBody();
    (body.marks || []).forEach((m: any) => {
      const existing = store.marks.find(
        (entry) => entry.examId === body.examId && entry.studentId === m.studentId && entry.subjectId === body.subjectId
      );
      if (existing) {
        existing.marksObtained = m.marksObtained;
        existing.grade = m.grade;
        existing.remarks = m.remarks;
      } else {
        store.marks.push({
          _id: 'mark-' + Date.now() + Math.random(),
          schoolId: 'school-gva-001',
          examId: body.examId,
          studentId: m.studentId,
          subjectId: body.subjectId,
          marksObtained: m.marksObtained,
          maxMarks: 100,
          grade: m.grade || (m.marksObtained >= 90 ? 'A+' : m.marksObtained >= 75 ? 'A' : 'B'),
          remarks: m.remarks,
        });
      }
    });
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Marks recorded successfully' } };
  }

  if (pathname === '/exams/report-card') {
    const studentId = getQuery('studentId');
    const examId = getQuery('examId');
    const student = store.students.find((s) => s._id === studentId) || store.students[0];
    const exam = store.exams.find((e) => e._id === examId) || store.exams[0];
    const report = {
      student,
      exam,
      subjects: [
        { name: 'Mathematics', maxMarks: 100, marksObtained: 94, grade: 'A+' },
        { name: 'General Science', maxMarks: 100, marksObtained: 88, grade: 'A' },
        { name: 'English Literature', maxMarks: 100, marksObtained: 92, grade: 'A+' },
        { name: 'Computer Applications', maxMarks: 100, marksObtained: 98, grade: 'A+' },
      ],
      totalMarks: 400,
      obtainedMarks: 372,
      percentage: 93,
      overallGrade: 'A+',
      rank: 1,
    };
    return { status: 200, data: { success: true, data: report } };
  }

  // ──────────────────────────── 11. Timetable ────────────────────────────
  if (pathname === '/timetable' && method === 'GET') {
    const classId = getQuery('classId');
    const sectionId = getQuery('sectionId');
    let list = [...store.timetableSlots];
    if (classId) list = list.filter((s) => s.classId === classId);
    if (sectionId) list = list.filter((s) => s.sectionId === sectionId);
    return { status: 200, data: { success: true, data: list } };
  }

  if (pathname === '/timetable/slots' && method === 'POST') {
    const body = parseBody();
    const sub = store.subjects.find((s) => s._id === body.subjectId);
    const teacher = store.teachers.find((t) => t._id === body.teacherId);
    const newSlot = {
      _id: 'tt-' + Date.now(),
      schoolId: 'school-gva-001',
      classId: body.classId,
      sectionId: body.sectionId,
      dayOfWeek: body.dayOfWeek,
      periodNumber: Number(body.periodNumber),
      startTime: body.startTime,
      endTime: body.endTime,
      subjectId: sub ? { _id: sub._id, name: sub.name, code: sub.code } : undefined,
      teacherId: teacher ? { _id: teacher._id, firstName: teacher.firstName, lastName: teacher.lastName } : undefined,
      room: body.room || 'Room 101',
    };
    store.timetableSlots.push(newSlot);
    saveMockStore(store);
    return { status: 201, data: { success: true, data: newSlot } };
  }

  if (pathname.startsWith('/timetable/slots/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.timetableSlots = store.timetableSlots.filter((s) => s._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Timetable slot deleted' } };
  }

  // ──────────────────────────── 12. Transport ────────────────────────────
  if (pathname === '/transport/buses') {
    if (method === 'GET') return { status: 200, data: { success: true, data: store.buses } };
    if (method === 'POST') {
      const body = parseBody();
      const driver = store.drivers.find((d) => d._id === body.driverId);
      const newBus = {
        _id: 'bus-' + Date.now(),
        schoolId: 'school-gva-001',
        busNumber: body.busNumber,
        registrationNumber: body.registrationNumber,
        capacity: Number(body.capacity) || 35,
        model: body.model || 'School Bus',
        driverId: driver ? { _id: driver._id, name: driver.name, phone: driver.phone, status: driver.status } : null,
        status: body.status || 'ACTIVE',
        currentLocation: {
          lat: 28.4595,
          lng: 77.0266,
          speed: 35,
          heading: 120,
          updatedAt: new Date().toISOString(),
        },
      };
      store.buses.push(newBus);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newBus } };
    }
  }

  if (pathname.startsWith('/transport/buses/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.buses = store.buses.filter((b) => b._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Bus removed' } };
  }

  if (pathname.startsWith('/transport/buses/') && pathname.endsWith('/location') && method === 'POST') {
    const id = pathname.split('/')[3];
    const body = parseBody();
    const bus = store.buses.find((b) => b._id === id);
    if (bus) {
      bus.currentLocation = {
        lat: body.lat,
        lng: body.lng,
        speed: body.speed || 30,
        heading: body.heading || 0,
        updatedAt: new Date().toISOString(),
      };
      saveMockStore(store);
    }
    return { status: 200, data: { success: true } };
  }

  if (pathname === '/transport/drivers') {
    if (method === 'GET') return { status: 200, data: { success: true, data: store.drivers } };
    if (method === 'POST') {
      const body = parseBody();
      const newDriver = {
        _id: 'driver-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        phone: body.phone,
        licenseNumber: body.licenseNumber,
        status: body.status || 'ACTIVE',
      };
      store.drivers.push(newDriver);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newDriver } };
    }
  }

  if (pathname.startsWith('/transport/drivers/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.drivers = store.drivers.filter((d) => d._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Driver removed' } };
  }

  if (pathname === '/transport/routes') {
    if (method === 'GET') return { status: 200, data: { success: true, data: store.routes } };
    if (method === 'POST') {
      const body = parseBody();
      const bus = store.buses.find((b) => b._id === body.busId);
      const newRoute = {
        _id: 'route-' + Date.now(),
        schoolId: 'school-gva-001',
        name: body.name,
        busId: bus ? { _id: bus._id, busNumber: bus.busNumber } : null,
        stops: body.stops || [],
        status: 'ACTIVE',
      };
      store.routes.push(newRoute);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newRoute } };
    }
  }

  if (pathname.startsWith('/transport/routes/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.routes = store.routes.filter((r) => r._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Route removed' } };
  }

  if (pathname === '/transport/assignments') {
    if (method === 'GET') return { status: 200, data: { success: true, data: store.transportAssignments } };
    if (method === 'POST') {
      const body = parseBody();
      const stu = store.students.find((s) => s._id === body.studentId);
      const bus = store.buses.find((b) => b._id === body.busId);
      const route = store.routes.find((r) => r._id === body.routeId);
      const newAssign = {
        _id: 'ta-' + Date.now(),
        schoolId: 'school-gva-001',
        studentId: stu
          ? { _id: stu._id, firstName: stu.firstName, lastName: stu.lastName, admissionNumber: stu.admissionNumber }
          : { _id: 'student-temp', firstName: 'Student', lastName: 'Demo', admissionNumber: 'GVA-999' },
        busId: bus ? { _id: bus._id, busNumber: bus.busNumber, registrationNumber: bus.registrationNumber } : null,
        routeId: route ? { _id: route._id, name: route.name } : null,
        stopName: body.stopName || 'Main Stop',
        pickupTime: body.pickupTime || '07:30 AM',
        dropTime: body.dropTime || '03:30 PM',
        status: 'ACTIVE',
      };
      store.transportAssignments.push(newAssign);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newAssign } };
    }
  }

  if (pathname.startsWith('/transport/assignments/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    store.transportAssignments = store.transportAssignments.filter((a) => a._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Assignment cancelled' } };
  }

  // ──────────────────────────── 13. Notices ────────────────────────────
  if (pathname === '/notices') {
    if (method === 'GET') {
      const audience = getQuery('audience');
      let list = [...store.notices];
      if (audience) list = list.filter((n) => n.audience === audience || n.audience === 'ALL');
      return { status: 200, data: { success: true, data: list } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newNotice = {
        _id: 'not-' + Date.now(),
        schoolId: 'school-gva-001',
        title: body.title,
        content: body.content,
        audience: body.audience || 'ALL',
        priority: body.priority || 'NORMAL',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        endDate: body.endDate,
        authorName: 'Dr. Rajesh Sharma',
        createdAt: new Date().toISOString(),
      };
      store.notices.unshift(newNotice);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newNotice } };
    }
  }

  if (pathname.startsWith('/notices/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.notices = store.notices.filter((n) => n._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Notice deleted' } };
  }

  // ──────────────────────────── 14. Homework ────────────────────────────
  if (pathname === '/homework') {
    if (method === 'GET') {
      const classId = getQuery('classId');
      let list = [...store.homework];
      if (classId) list = list.filter((h) => (h.classId?._id || h.classId) === classId);
      return { status: 200, data: { success: true, data: list } };
    }
    if (method === 'POST') {
      const body = parseBody();
      const targetClass = store.classes.find((c) => c._id === body.classId);
      const targetSub = store.subjects.find((s) => s._id === body.subjectId);
      const newHw = {
        _id: 'hw-' + Date.now(),
        schoolId: 'school-gva-001',
        title: body.title,
        description: body.description,
        classId: targetClass ? { _id: targetClass._id, name: targetClass.name } : undefined,
        subjectId: targetSub ? { _id: targetSub._id, name: targetSub.name } : undefined,
        dueDate: body.dueDate,
        status: 'ASSIGNED',
        createdAt: new Date().toISOString(),
      };
      store.homework.unshift(newHw);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newHw } };
    }
  }

  if (pathname.startsWith('/homework/') && method === 'DELETE') {
    const id = pathname.split('/')[2];
    store.homework = store.homework.filter((h) => h._id !== id);
    saveMockStore(store);
    return { status: 200, data: { success: true, message: 'Homework removed' } };
  }

  // ──────────────────────────── 15. Users ────────────────────────────
  if (pathname === '/users') {
    if (method === 'GET') {
      const search = getQuery('search').toLowerCase();
      const role = getQuery('role');
      const status = getQuery('status');
      let list = [...store.users];
      if (search) list = list.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
      if (role) list = list.filter((u) => u.role === role);
      if (status) list = list.filter((u) => u.status === status);
      return {
        status: 200,
        data: {
          success: true,
          data: list,
          pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
        },
      };
    }
    if (method === 'POST') {
      const body = parseBody();
      const newUser = {
        _id: 'user-' + Date.now(),
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role || 'STAFF',
        schoolId: 'school-gva-001',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      store.users.unshift(newUser);
      saveMockStore(store);
      return { status: 201, data: { success: true, data: newUser } };
    }
  }

  if (pathname.startsWith('/users/') && method === 'POST') {
    const parts = pathname.split('/');
    const id = parts[2];
    const action = parts[3];
    const user = store.users.find((u) => u._id === id);
    if (user) {
      if (action === 'activate') user.status = 'ACTIVE';
      if (action === 'deactivate') user.status = 'INACTIVE';
      saveMockStore(store);
      return { status: 200, data: { success: true, data: user } };
    }
  }

  // ──────────────────────────── 16. Reports ────────────────────────────
  if (pathname.startsWith('/reports/')) {
    const type = pathname.replace('/reports/', '');
    if (type === 'summary') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            totalStudents: store.students.length + 245,
            totalTeachers: store.teachers.length + 14,
            totalClasses: store.classes.length,
            averageAttendance: 91.5,
            totalFeesCollected: store.invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0),
            pendingFees: store.invoices.reduce((acc, i) => acc + (i.balanceAmount || 0), 0),
          },
        },
      };
    }
    if (type === 'students') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            genderBreakdown: { male: 145, female: 125, other: 0 },
            classWiseCount: store.classes.map((c) => ({ className: c.name, count: 35 })),
          },
        },
      };
    }
    if (type === 'attendance') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            overallRate: 92.4,
            dailyTrends: [
              { date: '2026-09-15', rate: 94 },
              { date: '2026-09-16', rate: 91 },
              { date: '2026-09-17', rate: 93 },
              { date: '2026-09-18', rate: 95 },
              { date: '2026-09-19', rate: 92 },
            ],
          },
        },
      };
    }
    if (type === 'fees') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            totalBilled: store.invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0),
            totalCollected: store.invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0),
            paymentMethodBreakdown: { UPI: 18500, NET_BANKING: 10000, CASH: 0 },
          },
        },
      };
    }
    if (type === 'exams') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            passPercentage: 96.8,
            topPerformers: [
              { name: 'Aarav Sharma', score: 94 },
              { name: 'Ananya Patel', score: 88 },
            ],
          },
        },
      };
    }
    if (type === 'transport') {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            activeBuses: store.buses.length,
            assignedStudents: store.transportAssignments.length,
            routesCount: store.routes.length,
          },
        },
      };
    }
  }

  // ──────────────────────────── 17. Audit Logs ────────────────────────────
  if (pathname === '/audit') {
    return {
      status: 200,
      data: {
        success: true,
        data: store.auditLogs,
        pagination: { page: 1, limit: 20, total: store.auditLogs.length, totalPages: 1 },
      },
    };
  }

  // Default fallback if not matched
  return null;
}
