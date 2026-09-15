import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { DashboardSkeleton } from '../components/ui/LoadingSkeleton';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermissions,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase() || '';

  // Super admin always bypasses
  if (userRole === 'SUPER_ADMIN') {
    return <Outlet />;
  }

  if (allowedRoles && !allowedRoles.map((r) => r.toUpperCase()).includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
