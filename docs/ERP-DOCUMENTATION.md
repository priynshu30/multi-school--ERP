# Multi-School ERP --- Production Development Documentation

## 1. Project Overview

Build a production-ready **Multi-School ERP / School Management SaaS**
using the MERN stack.

The platform must support multiple schools from one SaaS installation.
Each school has isolated data, its own administrators and staff,
students, parents, transport, attendance, fees, academics and reports.

The system must include:

-   Super Admin Panel
-   School Admin Portal
-   Teacher/Staff Portal
-   Student Portal
-   Parent Portal
-   Driver/Transport Portal
-   Live GPS bus tracking
-   Biometric attendance integration
-   Academic management
-   Student/parent management
-   Staff management
-   Attendance
-   Fees and payments
-   Exams and results
-   Timetable
-   Homework
-   Notices/events
-   Notifications
-   Reports
-   Audit logs
-   Subscription/plan management

The UI must be modern, premium, clean and responsive. Do NOT build a
generic old-style Bootstrap admin panel.

------------------------------------------------------------------------

# 2. Core Product Model

This is a **multi-tenant SaaS**.

Hierarchy:

Super Admin → Schools → School Admin → Staff / Teachers → Students →
Parents → Drivers

Every school-owned record must contain `schoolId`.

Example:

``` js
{
  _id,
  schoolId,
  name,
  classId,
  sectionId,
  parentId
}
```

A user belonging to School A must never be able to access School B data.

All APIs must enforce tenant isolation at middleware/service level, not
only in frontend.

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   React Router
-   Tailwind CSS
-   shadcn/ui or equivalent accessible component system
-   TanStack Query
-   React Hook Form
-   Zod
-   Recharts
-   Lucide React icons
-   Socket.IO Client
-   Leaflet or Mapbox for maps

## Backend

-   Node.js
-   Express.js
-   TypeScript
-   MongoDB
-   Mongoose
-   Redis
-   Socket.IO
-   JWT authentication
-   bcrypt/argon2 for password hashing
-   Zod or Joi validation
-   Multer for upload handling
-   Cloud object storage for documents/images

## Infrastructure

-   Docker
-   Nginx
-   CI/CD
-   MongoDB Atlas or managed MongoDB
-   Redis
-   S3-compatible object storage
-   HTTPS
-   Environment variables

------------------------------------------------------------------------

# 4. Architecture

Recommended architecture:

``` text
                    ┌────────────────────┐
                    │    SUPER ADMIN     │
                    └─────────┬──────────┘
                              │
                       Multi-Tenant SaaS
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
      SCHOOL A             SCHOOL B            SCHOOL C
          │                   │                   │
     ┌────┼────┐         ┌────┼────┐         ┌────┼────┐
   Admin Staff Students  Admin Staff Students Admin Staff
```

Backend:

``` text
React Apps
    ↓
API Layer
    ↓
Auth Middleware
    ↓
Tenant Middleware
    ↓
RBAC / Permission Middleware
    ↓
Controllers
    ↓
Services
    ↓
Repositories / Mongoose
    ↓
MongoDB
```

Real-time services:

``` text
Driver GPS
   ↓
Socket.IO
   ↓
Redis
   ↓
Subscribed Parent/Admin Clients
```

Biometric:

``` text
Biometric Device
      ↓
Integration Adapter
      ↓
Attendance Service
      ↓
MongoDB
```

------------------------------------------------------------------------

# 5. User Roles

Create RBAC from the beginning.

System roles:

``` text
SUPER_ADMIN
SCHOOL_ADMIN
PRINCIPAL
TEACHER
ACCOUNTANT
RECEPTIONIST
DRIVER
PARENT
STUDENT
STAFF
```

Do not hard-code authorization checks everywhere.

Use:

``` text
Role
→ Permissions
→ Resource
→ Action
```

Example permissions:

``` text
students.view
students.create
students.update
students.delete

attendance.view
attendance.mark
attendance.update

fees.view
fees.create
fees.collect
fees.refund

transport.view
transport.manage
transport.track
```

------------------------------------------------------------------------

# 6. Authentication

Implement:

-   Login
-   Logout
-   Refresh token
-   Access token
-   Forgot password
-   Reset password
-   Change password
-   Email/OTP verification where required
-   Session/device management
-   Account activation/deactivation

JWT should contain minimum identity information:

``` js
{
  userId,
  schoolId,
  role
}
```

Do not trust `schoolId` sent by the frontend.

Always derive the active tenant from authenticated user/session and
validate requested resources against it.

------------------------------------------------------------------------

# 7. Database Collections

Recommended collections:

``` text
users
schools
roles
permissions

students
parents
staff
teachers
drivers

academicYears
classes
sections
subjects

attendance
biometricLogs

feeStructures
studentFees
feePayments
invoices
receipts

exams
examTypes
marks
results

homework
timetable

buses
busRoutes
busStops
busAssignments
gpsLogs

notifications
announcements
events
messages

leaveRequests
documents

subscriptions
plans
payments

auditLogs
systemSettings
```

------------------------------------------------------------------------

# 8. School Model

School fields:

``` js
{
  name,
  code,
  slug,
  logo,
  email,
  phone,
  address,
  city,
  state,
  country,
  timezone,
  currency,
  academicYear,
  status,
  planId,
  settings,
  createdAt,
  updatedAt
}
```

Status:

``` text
ACTIVE
SUSPENDED
TRIAL
ARCHIVED
```

School slug can be used for branding/subdomain if required:

``` text
greenvalley.erp.com
sunrise.erp.com
```

------------------------------------------------------------------------

# 9. Student Module

Student profile:

``` text
Admission Number
Roll Number
First Name
Last Name
DOB
Gender
Blood Group
Photo
Email
Phone
Address
Class
Section
Academic Year
Parent/Guardian
Emergency Contact
Transport Assignment
Medical/extra information if legally required
Documents
Status
```

Student features:

-   Create student
-   Edit student
-   Student profile
-   Admission management
-   Class/section assignment
-   Parent linking
-   Documents
-   Attendance
-   Fees
-   Exams
-   Results
-   Homework
-   Timetable
-   Transport
-   Leave
-   Notices

Student detail page should use tabs:

``` text
Overview
Attendance
Fees
Academics
Homework
Timetable
Transport
Documents
Activity
```

------------------------------------------------------------------------

# 10. Parent Module

A parent can have multiple children.

Model:

``` text
Parent
 ├── Child 1
 ├── Child 2
 └── Child 3
```

Parent features:

-   Dashboard
-   Child switcher
-   Attendance
-   Homework
-   Results
-   Fees
-   Payment history
-   Timetable
-   Notices
-   Events
-   Teacher messages
-   Leave requests
-   Bus live tracking
-   Notifications
-   Profile

Parent dashboard:

``` text
Good Morning, Sarah

[ Emma ▼ ]

Attendance     Fee Due       Bus
94%            ₹4,500        On Route

Timetable
Homework
Results
Notices
Messages
Live Bus
```

------------------------------------------------------------------------

# 11. Staff / Teacher Module

Staff profile:

``` text
Employee ID
Name
Photo
Department
Designation
Subjects
Classes
Joining Date
Phone
Email
Address
Status
Documents
```

Teacher features:

-   Dashboard
-   My Classes
-   Students
-   Attendance
-   Homework
-   Exams
-   Marks
-   Timetable
-   Leave
-   Notices
-   Messages

Teacher dashboard should show:

``` text
My Classes
Total Students
Today's Attendance
Pending Homework
Today's Timetable
Recent Activity
```

------------------------------------------------------------------------

# 12. Academic Module

Entities:

``` text
Academic Year
Class
Section
Subject
Teacher Assignment
Student Enrollment
```

Example:

``` text
Academic Year: 2026-27

Class 5
 ├── Section A
 ├── Section B
 └── Section C

Subjects:
Math
Science
English
Social Science
Computer
```

Features:

-   Create academic year
-   Set active academic year
-   Classes
-   Sections
-   Subjects
-   Assign teachers
-   Assign students
-   Promote students
-   Transfer students
-   Archive previous year

------------------------------------------------------------------------

# 13. Attendance Module

Attendance statuses:

``` text
PRESENT
ABSENT
LATE
HALF_DAY
LEAVE
```

Teacher can mark attendance by:

``` text
School
Date
Class
Section
Subject/period if required
```

Bulk attendance UI:

``` text
Student              Status

Rahul Sharma         Present
Aman Kumar           Present
Neha Sharma          Absent
Priya Singh          Late
```

Provide:

-   Mark attendance
-   Edit attendance
-   Daily attendance
-   Monthly attendance
-   Student attendance history
-   Class attendance report
-   Staff attendance
-   Attendance percentage

------------------------------------------------------------------------

# 14. Biometric Attendance

Biometric integration must be device-agnostic.

Create an adapter/service layer:

``` text
Biometric Provider
       ↓
Device Adapter
       ↓
Biometric Service
       ↓
Attendance Service
```

Do not tightly couple the ERP to one biometric vendor.

Store attendance events rather than unnecessary biometric templates.

Example:

``` js
{
  schoolId,
  deviceId,
  employeeId,
  studentId,
  eventType: "CHECK_IN",
  timestamp,
  rawEventId,
  source: "BIOMETRIC"
}
```

Prevent duplicate events with idempotency keys.

------------------------------------------------------------------------

# 15. Fees & Accounts

Entities:

``` text
Fee Structure
Student Fee
Invoice
Payment
Receipt
Discount
Scholarship
Refund
```

Example fee structure:

``` text
Tuition Fee
Transport Fee
Exam Fee
Library Fee
Activity Fee
```

Features:

-   Configure fees
-   Assign fees to class/students
-   Generate invoices
-   Record payment
-   Online payment integration later
-   Partial payments
-   Discounts
-   Due dates
-   Late fees
-   Receipts
-   Refunds
-   Outstanding report
-   Collection report

Payment status:

``` text
PENDING
PARTIAL
PAID
OVERDUE
CANCELLED
REFUNDED
```

Never trust payment status from frontend.

------------------------------------------------------------------------

# 16. Exams & Results

Entities:

``` text
Exam Type
Exam
Subject
Exam Schedule
Marks
Grade
Result
```

Features:

-   Create exam
-   Schedule exams
-   Assign subjects
-   Enter marks
-   Bulk marks entry
-   Grade calculation
-   Result publication
-   Report card
-   Student result history

Example:

``` text
Math       86
Science    91
English    88
Computer   95

Overall: A+
```

Grade rules must be configurable by school.

------------------------------------------------------------------------

# 17. Homework

Teacher can:

-   Create homework
-   Assign class/section
-   Attach files
-   Set due date
-   Edit/delete
-   Track completion

Student/parent can:

-   View homework
-   Download attachments
-   Submit work if enabled
-   See overdue homework

------------------------------------------------------------------------

# 18. Timetable

Features:

-   Class timetable
-   Teacher timetable
-   Room timetable
-   Period management
-   Days
-   Subjects
-   Teachers
-   Conflict detection

Prevent:

``` text
Teacher assigned to two classes
in same period.
```

Also prevent room conflicts if rooms are used.

------------------------------------------------------------------------

# 19. Transport Module

Entities:

``` text
Bus
Driver
Route
Stop
Student Assignment
Bus Assignment
GPS Session
GPS Location
```

Bus:

``` js
{
  schoolId,
  busNumber,
  registrationNumber,
  capacity,
  status,
  deviceId
}
```

Driver:

``` text
Driver
License Number
Phone
Assigned Bus
Status
```

Route:

``` text
School
 ↓
Stop 1
 ↓
Stop 2
 ↓
Stop 3
 ↓
Stop 4
```

------------------------------------------------------------------------

# 20. Live GPS Tracking

Driver application sends location periodically.

Example event:

``` js
socket.emit("driver:location", {
  busId,
  routeId,
  lat,
  lng,
  speed,
  heading,
  accuracy,
  timestamp
});
```

Server validates:

-   Driver is authenticated
-   Driver is assigned to bus
-   Bus belongs to same school
-   Location values are valid

Then publish:

``` text
transport:bus:{busId}
```

Parents subscribed to the relevant bus receive updates.

Do not write every GPS update to MongoDB.

Use Redis/current-state storage for live location and optionally
sample/persist historical locations at intervals.

------------------------------------------------------------------------

# 21. GPS Parent Experience

Parent sees:

``` text
BUS #204
● Live

Driver: Rahul
Speed: 32 km/h
ETA: 8 min

Next Stop:
Sunrise Colony

Route:
School
 ↓
Sunrise Colony
 ↓
Green Park
 ↓
Your Stop
```

Map should update without page refresh.

------------------------------------------------------------------------

# 22. Notifications

Notification channels:

``` text
In-app
Push
Email
SMS/WhatsApp integration later
```

Notification examples:

-   Fee due
-   Payment received
-   Student absent
-   Exam result published
-   Homework assigned
-   Bus approaching
-   School notice
-   Parent meeting

Create notification preferences.

------------------------------------------------------------------------

# 23. Notices & Events

Admin can create:

``` text
Title
Description
Audience
Start Date
End Date
Attachments
Priority
```

Audience:

``` text
All School
Teachers
Parents
Students
Specific Class
Specific Section
```

Events:

``` text
Parent Meeting
Holiday
Exam
Annual Function
Sports Day
School Event
```

------------------------------------------------------------------------

# 24. Messaging

Implement role-based communication.

Examples:

``` text
Parent ↔ Teacher
Admin → Parents
Admin → Teachers
Teacher → Class Parents
```

Use Socket.IO for real-time chat if chat is enabled.

Store conversations and messages separately.

------------------------------------------------------------------------

# 25. Reports

Reports should support:

-   Student report
-   Attendance report
-   Fee collection report
-   Outstanding fee report
-   Exam result report
-   Teacher report
-   Transport report
-   Staff attendance
-   Admission report

Provide:

``` text
Filter
Search
Date range
Class
Section
Export CSV
Export PDF
```

------------------------------------------------------------------------

# 26. Super Admin Panel

Super Admin is system-wide.

Dashboard:

``` text
Total Schools
Active Schools
Total Students
Total Staff
Monthly Revenue
Active Subscriptions
New Schools
Support Tickets
```

School management:

``` text
Schools
Add School
Edit School
Suspend School
Activate School
View School
Impersonation/support access with strong audit logging
```

Subscription:

``` text
Plans
Features
Limits
Billing
Subscription status
Invoices
```

Example plans:

``` text
Basic
Pro
Enterprise
```

Possible limits:

``` text
maxStudents
maxStaff
maxAdmins
storage
transport
biometric
reports
```

------------------------------------------------------------------------

# 27. UI / UX Requirements

The UI must look like a modern SaaS product.

Design language:

-   Clean
-   Premium
-   Spacious
-   Professional
-   Education-focused
-   Responsive
-   Accessible
-   Fast

Avoid:

-   Old Bootstrap look
-   Excessive gradients
-   Excessive shadows
-   Too many colors
-   Huge icons
-   Crowded tables
-   Tiny text
-   Random card designs

Use:

-   Rounded cards
-   Consistent spacing
-   Clear hierarchy
-   Modern typography
-   Subtle borders
-   Small shadows
-   Consistent icons
-   Sticky table headers where useful
-   Skeleton loading
-   Empty states
-   Confirmation dialogs
-   Toast notifications

Suggested visual palette:

``` text
Background: very light gray/blue
Primary: deep navy / modern blue
Success: green
Warning: amber
Danger: red
Text: dark slate
Muted: gray
```

------------------------------------------------------------------------

# 28. School Admin Dashboard UI

Desktop layout:

``` text
┌───────────────────────────────────────────────────────────────┐
│ Logo  School Name       Search       Notifications  Profile │
├───────────────┬───────────────────────────────────────────────┤
│ Dashboard     │ Good Morning, Admin 👋                       │
│ Students      │ Here's what's happening today.              │
│ Parents       │                                               │
│ Teachers      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│ Attendance    │ │Students│ │ Staff  │ │Attend. │ │ Fees   │ │
│ Classes       │ └────────┘ └────────┘ └────────┘ └────────┘ │
│ Fees          │                                               │
│ Exams         │ ┌─────────────────────┐ ┌──────────────────┐ │
│ Timetable     │ │ Attendance Overview │ │ Quick Actions    │ │
│ Transport     │ │       Chart         │ │ Add Student      │ │
│ Homework      │ │                     │ │ Add Teacher      │ │
│ Notices       │ └─────────────────────┘ │ Add Notice       │ │
│ Reports       │                         └──────────────────┘ │
│ Settings      │                                               │
└───────────────┴───────────────────────────────────────────────┘
```

Dashboard cards:

``` text
Total Students
Total Staff
Present Today
Fee Collection
```

------------------------------------------------------------------------

# 29. Parent Dashboard UI

Parent UI should be simpler than admin.

Top:

``` text
Good Morning, Sarah 👋

[ Emma Wilson ▼ ]
```

Cards:

``` text
Attendance 94%
Fees Due ₹4,500
Bus ● On Route
Next Exam 12 Jun
```

Quick actions:

``` text
Timetable
Homework
Results
Notices
Messages
Track Bus
```

Mobile bottom navigation:

``` text
Home
Attendance
Fees
Bus
Profile
```

------------------------------------------------------------------------

# 30. Student Dashboard UI

Show:

``` text
Attendance
Overall Grade
Fee Status
Today's Timetable
Homework
Latest Notices
Upcoming Exams
```

Use student-friendly but professional visuals.

------------------------------------------------------------------------

# 31. Teacher Dashboard UI

Show:

``` text
My Classes
Total Students
Attendance
Pending Homework

Today's Classes
Recent Activities
Quick Actions
```

Quick actions:

``` text
Mark Attendance
Add Homework
Enter Marks
View Students
```

------------------------------------------------------------------------

# 32. Super Admin Dashboard UI

Use a different visual identity but the same design system.

Show:

``` text
Total Schools
Active Schools
Students
Staff
Revenue
Subscriptions
```

School table:

``` text
School
Students
Staff
Plan
Status
Created
Actions
```

------------------------------------------------------------------------

# 33. Navigation

School Admin sidebar:

``` text
Dashboard

Students
Parents
Staff & Teachers

Academics
  Classes & Sections
  Subjects
  Academic Years
  Timetable

Attendance

Exams & Results

Fees & Accounts

Transport
  Buses
  Drivers
  Routes
  Live Tracking

Homework

Notices & Events

Messages

Reports

Settings
```

Use collapsible groups.

------------------------------------------------------------------------

# 34. Component Design System

Create reusable components:

``` text
Button
Input
Select
DatePicker
Modal
Drawer
Dropdown
Tabs
Badge
Avatar
Card
DataTable
Pagination
SearchInput
FilterBar
StatCard
ChartCard
EmptyState
LoadingSkeleton
ConfirmDialog
Toast
FileUpload
Map
Timeline
```

Do not duplicate components page by page.

------------------------------------------------------------------------

# 35. Data Table Requirements

Every major table should support:

-   Search
-   Filters
-   Sort
-   Pagination
-   Column visibility
-   Bulk actions where useful
-   Export
-   Loading state
-   Empty state
-   Error state
-   Responsive behavior

Student table:

``` text
Avatar
Name
Admission No
Class
Section
Parent
Attendance
Fee Status
Status
Actions
```

Actions:

``` text
View
Edit
Deactivate
Delete
```

Use confirmation before destructive operations.

------------------------------------------------------------------------

# 36. API Structure

Use versioned REST APIs.

``` text
/api/v1/auth
/api/v1/schools
/api/v1/users
/api/v1/students
/api/v1/parents
/api/v1/staff
/api/v1/teachers
/api/v1/classes
/api/v1/sections
/api/v1/subjects
/api/v1/attendance
/api/v1/fees
/api/v1/exams
/api/v1/results
/api/v1/homework
/api/v1/timetable
/api/v1/transport
/api/v1/notifications
/api/v1/reports
/api/v1/subscriptions
```

Example:

``` http
GET /api/v1/students
POST /api/v1/students
GET /api/v1/students/:id
PATCH /api/v1/students/:id
DELETE /api/v1/students/:id
```

------------------------------------------------------------------------

# 37. API Response Format

Use consistent responses.

Success:

``` json
{
  "success": true,
  "data": {},
  "message": "Student created successfully"
}
```

Paginated:

``` json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error:

``` json
{
  "success": false,
  "message": "Student not found",
  "code": "STUDENT_NOT_FOUND"
}
```

------------------------------------------------------------------------

# 38. Backend Folder Structure

Use modular architecture:

``` text
server/
├── src/
│   ├── config/
│   ├── database/
│   ├── middlewares/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── schools/
│   │   ├── users/
│   │   ├── students/
│   │   ├── parents/
│   │   ├── staff/
│   │   ├── academics/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── exams/
│   │   ├── homework/
│   │   ├── timetable/
│   │   ├── transport/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── subscriptions/
│   │
│   ├── sockets/
│   ├── app.ts
│   └── server.ts
│
└── package.json
```

Each module:

``` text
students/
├── student.model.ts
├── student.controller.ts
├── student.service.ts
├── student.repository.ts
├── student.routes.ts
├── student.validation.ts
└── student.types.ts
```

------------------------------------------------------------------------

# 39. Frontend Folder Structure

``` text
client/
├── src/
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── types/
│   ├── routes/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── parents/
│   │   ├── staff/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── exams/
│   │   ├── homework/
│   │   ├── timetable/
│   │   ├── transport/
│   │   ├── notifications/
│   │   └── reports/
│   │
│   ├── pages/
│   └── main.tsx
```

------------------------------------------------------------------------

# 40. Security Requirements

Mandatory:

-   HTTPS
-   Password hashing
-   JWT rotation/refresh strategy
-   Rate limiting
-   CORS configuration
-   Helmet/security headers
-   Input validation
-   MongoDB query safety
-   File upload validation
-   Role/permission checks
-   Tenant isolation
-   Audit logs
-   Secure cookies where appropriate
-   No secrets in frontend
-   No sensitive data in logs

Important:

Never trust:

``` text
schoolId
role
userId
price
paymentStatus
permissions
```

when supplied by the browser.

------------------------------------------------------------------------

# 41. Audit Logs

Track important actions:

``` text
Who
School
Action
Resource
Resource ID
Before
After
IP
User Agent
Timestamp
```

Examples:

``` text
Admin changed student class
Accountant recorded payment
Super Admin suspended school
Teacher edited marks
```

Audit logs should be immutable to normal users.

------------------------------------------------------------------------

# 42. File Management

Documents can include:

``` text
Student photo
Birth certificate
Transfer certificate
ID document
Teacher documents
Fee receipts
Homework attachments
School logo
```

Do not store large files directly in MongoDB.

Use object storage and store:

``` text
fileUrl
storageKey
fileName
mimeType
size
uploadedBy
schoolId
```

Validate file type and size.

------------------------------------------------------------------------

# 43. Search

Provide global search where useful:

``` text
Students
Parents
Staff
Teachers
Invoices
Buses
```

Search should be tenant-scoped.

------------------------------------------------------------------------

# 44. Notifications Architecture

Use notification service:

``` text
Event
 ↓
Notification Service
 ↓
Create Notification
 ↓
In-app
Push
Email
SMS
```

Do not send external notifications directly from controllers.

------------------------------------------------------------------------

# 45. Performance

Use:

-   Database indexes
-   Pagination
-   Lean MongoDB queries where appropriate
-   Redis caching
-   Background jobs
-   Lazy loading
-   Code splitting
-   Image optimization
-   Debounced search
-   Virtualized large tables where needed

Important indexes:

``` text
schoolId
schoolId + email
schoolId + admissionNumber
schoolId + classId
schoolId + sectionId
schoolId + createdAt
schoolId + status
```

Add compound indexes based on actual query patterns.

------------------------------------------------------------------------

# 46. Background Jobs

Use Redis-backed job queue such as BullMQ if required.

Jobs:

``` text
Send email
Send notification
Generate report
Generate invoice
Generate PDF
Process biometric sync
Process GPS history
Subscription reminders
```

------------------------------------------------------------------------

# 47. Error Handling

Central error middleware.

Errors should have:

``` text
statusCode
code
message
details
```

Frontend should show friendly messages.

Never expose stack traces in production.

------------------------------------------------------------------------

# 48. Environment Variables

Example:

``` env
NODE_ENV=development
PORT=5000

MONGO_URI=
REDIS_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLIENT_URL=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

MAP_PROVIDER_KEY=
PAYMENT_PROVIDER_KEY=
```

Never commit `.env`.

Provide `.env.example`.

------------------------------------------------------------------------

# 49. Seed Data

Create seed script that generates:

``` text
1 Super Admin
2 Demo Schools

School A:
Admin
Teachers
Parents
Students
Drivers
Classes
Sections
Subjects
Buses

School B:
Same demo structure
```

This is important for development/testing.

------------------------------------------------------------------------

# 50. Testing

Implement:

## Unit Tests

Test:

``` text
Auth
Permission checks
Tenant isolation
Fee calculations
Grade calculations
Attendance calculations
GPS validation
```

## Integration Tests

Test:

``` text
Login
Create student
Create school
Mark attendance
Create fee
Record payment
Create exam
Publish result
Driver GPS update
Parent bus tracking
```

## Frontend Tests

Test important user flows.

------------------------------------------------------------------------

# 51. Tenant Isolation Tests

This is mandatory.

Example:

``` text
School A Admin
attempts:
GET /students/{School B student ID}

Expected:
403 or 404
```

Also test:

``` text
School A cannot query School B invoices
School A cannot view School B buses
School A cannot access School B reports
```

------------------------------------------------------------------------

# 52. Responsive Design

Desktop:

``` text
Sidebar + Main Content
```

Tablet:

``` text
Collapsible Sidebar
```

Mobile:

``` text
Top Bar
Bottom Navigation where useful
Drawer Navigation
```

Parent and Teacher portals must be excellent on mobile.

Admin dashboard can be desktop-first but must remain responsive.

------------------------------------------------------------------------

# 53. Accessibility

Use:

-   Keyboard navigation
-   Focus states
-   Semantic HTML
-   Proper labels
-   Accessible dialogs
-   Good contrast
-   ARIA only where needed
-   Screen-reader-friendly controls

------------------------------------------------------------------------

# 54. UX States

Every page must have:

``` text
Loading
Success
Error
Empty
No Permission
Not Found
```

Example empty state:

``` text
No students found

Try changing your filters or add your first student.

[ + Add Student ]
```

------------------------------------------------------------------------

# 55. Development Rules for Copilot

When implementing this project:

1.  Use TypeScript.
2.  Do not create one giant file.
3.  Use modular architecture.
4.  Build reusable components.
5.  Keep frontend and backend separated.
6.  Never duplicate business logic.
7.  Never trust frontend authorization.
8.  Enforce school tenant isolation in backend.
9.  Validate every request.
10. Use consistent API responses.
11. Use proper loading/error/empty states.
12. Use pagination for large datasets.
13. Add indexes for frequent queries.
14. Keep secrets in environment variables.
15. Write clean maintainable code.
16. Add comments only where logic is non-obvious.
17. Do not use fake hard-coded production data.
18. Use seed data only for development/demo.
19. Make UI responsive.
20. Do not sacrifice security for speed.

------------------------------------------------------------------------

# 56. Implementation Order

Do NOT generate the entire application in one response.

Build incrementally.

## Sprint 1 --- Foundation

``` text
Project setup
TypeScript
MongoDB
Express
React
Tailwind
Authentication
JWT
RBAC
Multi-tenancy
Global error handling
Validation
Logging
```

## Sprint 2 --- School & Users

``` text
Schools
Users
Roles
Permissions
School Admin
Staff
Teachers
```

## Sprint 3 --- Students & Parents

``` text
Students
Parents
Parent-child relation
Admissions
Documents
Student profiles
```

## Sprint 4 --- Academics

``` text
Academic Years
Classes
Sections
Subjects
Teacher assignment
Student enrollment
```

## Sprint 5 --- Attendance

``` text
Student attendance
Staff attendance
Reports
Biometric adapter architecture
```

## Sprint 6 --- Fees

``` text
Fee structures
Invoices
Payments
Receipts
Reports
```

## Sprint 7 --- Exams

``` text
Exam
Schedule
Marks
Grades
Results
Report cards
```

## Sprint 8 --- Homework & Timetable

``` text
Homework
Attachments
Timetable
Conflict detection
```

## Sprint 9 --- Transport

``` text
Drivers
Buses
Routes
Stops
Assignments
Live GPS
Socket.IO
Redis
```

## Sprint 10 --- Notifications

``` text
In-app notifications
Email
Push architecture
Messaging
```

## Sprint 11 --- Super Admin

``` text
Platform dashboard
Schools
Plans
Subscriptions
Revenue
Audit logs
```

## Sprint 12 --- Production

``` text
Security
Testing
Performance
Docker
CI/CD
Monitoring
Backups
Production deployment
```

------------------------------------------------------------------------

# 57. Initial MVP

If development time is limited, launch MVP with:

``` text
Authentication
Multi-tenancy
School management
Students
Parents
Teachers
Classes
Sections
Attendance
Fees
Exams
Notices
Transport
Live GPS
Dashboards
Reports
```

Then add:

``` text
Biometric integrations
Payments
Messaging
Push notifications
Advanced analytics
Subscriptions
Mobile apps
```

------------------------------------------------------------------------

# 58. Definition of Done

A module is not complete until:

-   UI is responsive
-   API is validated
-   Authentication works
-   Authorization works
-   Tenant isolation works
-   Loading state exists
-   Error state exists
-   Empty state exists
-   Pagination exists where required
-   Audit logging exists where required
-   Tests cover critical logic
-   No TypeScript errors
-   No console errors
-   No hard-coded production secrets
-   API errors are handled
-   Mobile layout is checked

------------------------------------------------------------------------

# 59. Copilot Master Instruction

Use the following as the main instruction when starting implementation:

> You are a senior full-stack MERN architect and engineer.
>
> Build this application as a production-ready Multi-School ERP SaaS
> based on the documentation above.
>
> Use React + TypeScript + Vite + Tailwind on the frontend and Node.js +
> Express + TypeScript + MongoDB/Mongoose on the backend. Use Redis and
> Socket.IO for real-time transport tracking.
>
> The most important architectural requirement is multi-tenancy. Every
> school-owned resource must be isolated by `schoolId`. Never trust
> schoolId, role, permissions, prices, payment states, or other
> security-sensitive values from the frontend.
>
> Implement RBAC with permissions, modular backend architecture,
> reusable frontend components, request validation, centralized error
> handling, consistent API responses, pagination, database indexes,
> audit logs, and secure authentication.
>
> Build the application incrementally by sprint/module. Do not generate
> the entire project in one huge response.
>
> Before implementing a module:
>
> 1.  Explain the module architecture briefly.
> 2.  List the files that will be created/changed.
> 3.  Implement backend model, validation, service, controller, routes
>     and tests.
> 4.  Implement frontend API layer, hooks, pages and reusable
>     components.
> 5.  Add loading, error and empty states.
> 6.  Check role permissions.
> 7.  Check tenant isolation.
> 8.  Check responsive UI.
> 9.  Fix TypeScript/lint errors.
> 10. Summarize what was implemented and what should be built next.
>
> Never replace existing working code unnecessarily.
>
> Keep naming consistent across frontend, backend, database and API.
>
> The UI must be premium, modern, clean, responsive and SaaS-quality.
> Avoid generic Bootstrap-style dashboards. Use a consistent design
> system with a professional education-focused visual language, reusable
> cards, tables, charts, filters, dialogs, badges, navigation and
> responsive layouts.
>
> Start with Sprint 1: project foundation, authentication, RBAC,
> multi-tenancy, database connection, API structure, error handling,
> validation and basic dashboard layouts.

------------------------------------------------------------------------

# 60. Final Product Vision

The final product should feel like a professional SaaS platform, not a
college project.

The user experience should be:

``` text
Super Admin
    ↓
Manage Schools
    ↓
School Admin
    ↓
Manage School
    ↓
Teachers / Staff
    ↓
Manage Students
    ↓
Parents / Students
    ↓
Attendance / Fees / Exams / Homework
    ↓
Transport
    ↓
Live GPS
```

The architecture should be capable of starting with a few schools and
scaling toward hundreds or thousands of schools without rewriting the
entire system.
