import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { LoginPage } from '../pages/LoginPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { SchoolAdminDashboard } from '../pages/SchoolAdminDashboard';
import { SuperAdminDashboard } from '../pages/SuperAdminDashboard';
import { SchoolsPage } from '../pages/SchoolsPage';
import { StaffPage } from '../pages/StaffPage';
import { TeachersPage } from '../pages/TeachersPage';
import { UsersPage } from '../pages/UsersPage';
import { StudentsPage } from '../pages/StudentsPage';
import { ParentsPage } from '../pages/ParentsPage';
import { AcademicsPage } from '../pages/AcademicsPage';
import { AttendancePage } from '../pages/AttendancePage';
import { FeesPage } from '../pages/FeesPage';
import { ExamsPage } from '../pages/ExamsPage';
import { HomeworkPage } from '../pages/HomeworkPage';
import { TimetablePage } from '../pages/TimetablePage';
import { NoticesPage } from '../pages/NoticesPage';
import { TransportPage } from '../pages/TransportPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { PlatformSettingsPage } from '../pages/PlatformSettingsPage';
import { SchoolSettingsPage } from '../pages/SchoolSettingsPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const RoleBasedHome: React.FC = () => {
  const { user } = useAuth();
  if (user?.role?.toUpperCase() === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }
  return <SchoolAdminDashboard />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Dashboard Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RoleBasedHome />} />

          {/* Sprint 2: Schools — SUPER_ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/schools" element={<SchoolsPage />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/audit" element={<AuditLogsPage />} />
            <Route path="/super-admin/settings" element={<PlatformSettingsPage />} />
          </Route>

          {/* Sprint 2: Staff & Teachers — SCHOOL_ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}>
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
          </Route>

          {/* Sprint 2: Users — SUPER_ADMIN + SCHOOL_ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* School Settings — SCHOOL_ADMIN & PRINCIPAL */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL']} />}>
            <Route path="/settings" element={<SchoolSettingsPage />} />
          </Route>

          {/* Sprint 3: Students & Parents — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/parents" element={<ParentsPage />} />
          </Route>

          {/* Sprint 4: Academics — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/academics" element={<AcademicsPage />} />
          </Route>

          {/* Sprint 5: Attendance — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/attendance" element={<AttendancePage />} />
          </Route>

          {/* Sprint 6: Fees & Invoicing — SCHOOL_ADMIN & PRINCIPAL & ACCOUNTANT */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']} />}>
            <Route path="/fees" element={<FeesPage />} />
          </Route>

          {/* Sprint 7: Exams & Results — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/exams" element={<ExamsPage />} />
          </Route>

          {/* Sprint 8: Homework, Timetable & Notices — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/homework" element={<HomeworkPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/notices" element={<NoticesPage />} />
          </Route>

          {/* Sprint 9: Transport & Live GPS — SCHOOL_ADMIN & PRINCIPAL & TEACHER */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
            <Route path="/transport" element={<TransportPage />} />
          </Route>

          {/* Sprint 10: Reports & Analytics — SCHOOL_ADMIN & PRINCIPAL & ACCOUNTANT */}
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
