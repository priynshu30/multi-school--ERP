import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string | null;
  permissions: string[];
  avatar?: string;
  phone?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  slug: string;
  status: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  school: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendOtp: (identifier: string) => Promise<{ success: boolean; message: string; demoOtp?: string }>;
  loginWithOtp: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<string, { user: User; school: School | null }> = {
  'superadmin@erp.com': {
    user: {
      _id: 'user-superadmin-001',
      name: 'Platform Super Admin',
      email: 'superadmin@erp.com',
      role: 'SUPER_ADMIN',
      schoolId: null,
      permissions: ['*'],
      phone: '+91 98765 43210',
    },
    school: null,
  },
  'admin@greenvalley.edu': {
    user: {
      _id: 'user-admin-gva-002',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@greenvalley.edu',
      role: 'SCHOOL_ADMIN',
      schoolId: 'school-gva-001',
      permissions: [
        'schools.view',
        'users.view',
        'users.create',
        'users.update',
        'users.activate',
        'staff.view',
        'staff.create',
        'staff.update',
        'staff.delete',
        'teachers.view',
        'teachers.create',
        'teachers.update',
        'teachers.delete',
        'students.view',
        'students.create',
        'students.update',
        'students.delete',
        'parents.view',
        'parents.create',
        'parents.update',
        'parents.delete',
        'attendance.view',
        'attendance.mark',
        'attendance.update',
        'fees.view',
        'fees.create',
        'fees.collect',
        'fees.refund',
        'transport.view',
        'transport.manage',
        'transport.track',
        'academics.manage',
        'academics.view',
        'exams.manage',
        'exams.marks.enter',
        'exams.view',
      ],
      phone: '+91 98111 22334',
    },
    school: {
      id: 'school-gva-001',
      name: 'Green Valley Academy',
      code: 'GVA-101',
      slug: 'greenvalley',
      status: 'ACTIVE',
      currency: 'INR',
    },
  },
  'admin@horizon.edu': {
    user: {
      _id: 'user-admin-his-003',
      name: 'Anita Desai',
      email: 'admin@horizon.edu',
      role: 'SCHOOL_ADMIN',
      schoolId: 'school-his-002',
      permissions: [
        'schools.view',
        'users.view',
        'users.create',
        'users.update',
        'users.activate',
        'staff.view',
        'staff.create',
        'staff.update',
        'staff.delete',
        'teachers.view',
        'teachers.create',
        'teachers.update',
        'teachers.delete',
        'students.view',
        'students.create',
        'students.update',
        'students.delete',
        'parents.view',
        'parents.create',
        'parents.update',
        'parents.delete',
        'attendance.view',
        'attendance.mark',
        'attendance.update',
        'fees.view',
        'fees.create',
        'fees.collect',
        'fees.refund',
        'transport.view',
        'transport.manage',
        'transport.track',
        'academics.manage',
        'academics.view',
        'exams.manage',
        'exams.marks.enter',
        'exams.view',
      ],
      phone: '+91 98222 33445',
    },
    school: {
      id: 'school-his-002',
      name: 'Horizon International School',
      code: 'HIS-202',
      slug: 'horizon',
      status: 'ACTIVE',
      currency: 'INR',
    },
  },
  'teacher@greenvalley.edu': {
    user: {
      _id: 'user-teacher-004',
      name: 'Pooja Verma',
      email: 'teacher@greenvalley.edu',
      role: 'TEACHER',
      schoolId: 'school-gva-001',
      permissions: [
        'students.view',
        'attendance.view',
        'attendance.mark',
        'academics.view',
        'exams.marks.enter',
        'exams.view',
      ],
      phone: '+91 98111 55667',
    },
    school: {
      id: 'school-gva-001',
      name: 'Green Valley Academy',
      code: 'GVA-101',
      slug: 'greenvalley',
      status: 'ACTIVE',
      currency: 'INR',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from tokens
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for mock demo session first
      if (localStorage.getItem('isMockAuth') === 'true') {
        const storedUser = localStorage.getItem('mockUser');
        const storedSchool = localStorage.getItem('mockSchool');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setSchool(storedSchool ? JSON.parse(storedSchool) : null);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse mock session:', e);
          }
        }
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
          setSchool(response.data.data.school);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isMockAuth');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockSchool');
        setUser(null);
        setSchool(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const response = await apiClient.post('/auth/login', { email: normalizedEmail, password });
      if (response.data?.success) {
        const { user: loggedInUser, school: loggedInSchool, tokens } = response.data.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.removeItem('isMockAuth');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockSchool');
        setUser(loggedInUser);
        setSchool(loggedInSchool);
        return;
      }
    } catch (apiError: any) {
      // If backend explicitly rejected credentials with 401 and valid JSON response
      if (apiError.response?.status === 401 && apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }

      // Check for demo user fallback when backend is unreachable or 404
      const demoAccount = DEMO_ACCOUNTS[normalizedEmail];
      if (demoAccount && (password === 'Admin@123' || !apiError.response || apiError.response?.status === 404)) {
        localStorage.setItem('accessToken', 'mock-demo-token');
        localStorage.setItem('refreshToken', 'mock-demo-refresh-token');
        localStorage.setItem('isMockAuth', 'true');
        localStorage.setItem('mockUser', JSON.stringify(demoAccount.user));
        localStorage.setItem('mockSchool', JSON.stringify(demoAccount.school));
        setUser(demoAccount.user);
        setSchool(demoAccount.school);
        return;
      }

      // If backend was not reached (e.g. 404 or Network Error on Vercel deployment without backend)
      if (!apiError.response || apiError.response.status === 404 || apiError.code === 'ERR_NETWORK') {
        // Fallback for any email if password is Admin@123 or demo credentials
        if (password === 'Admin@123') {
          const isSuper = normalizedEmail.includes('super');
          const isTeacher = normalizedEmail.includes('teacher');
          const assignedRole = isSuper ? 'SUPER_ADMIN' : isTeacher ? 'TEACHER' : 'SCHOOL_ADMIN';

          const teacherPermissions = [
            'students.view',
            'attendance.view',
            'attendance.mark',
            'academics.view',
            'exams.marks.enter',
            'exams.view',
          ];

          const schoolAdminPermissions = [
            'schools.view',
            'users.view',
            'users.create',
            'users.update',
            'users.activate',
            'staff.view',
            'staff.create',
            'staff.update',
            'staff.delete',
            'teachers.view',
            'teachers.create',
            'teachers.update',
            'teachers.delete',
            'students.view',
            'students.create',
            'students.update',
            'students.delete',
            'parents.view',
            'parents.create',
            'parents.update',
            'parents.delete',
            'attendance.view',
            'attendance.mark',
            'attendance.update',
            'fees.view',
            'fees.create',
            'fees.collect',
            'fees.refund',
            'transport.view',
            'transport.manage',
            'transport.track',
            'academics.manage',
            'academics.view',
            'exams.manage',
            'exams.marks.enter',
            'exams.view',
          ];

          const genericUser: User = {
            _id: 'user-' + assignedRole.toLowerCase() + '-' + Date.now(),
            name: normalizedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
            email: normalizedEmail,
            role: assignedRole,
            permissions: isSuper ? ['*'] : isTeacher ? teacherPermissions : schoolAdminPermissions,
          };
          localStorage.setItem('accessToken', 'mock-demo-token');
          localStorage.setItem('refreshToken', 'mock-demo-refresh-token');
          localStorage.setItem('isMockAuth', 'true');
          localStorage.setItem('mockUser', JSON.stringify(genericUser));
          setUser(genericUser);
          setSchool(null);
          return;
        }

        throw new Error(
          'Backend server is not connected. Use demo account (e.g. superadmin@erp.com / Admin@123) or click any demo button.'
        );
      }

      throw new Error(apiError.response?.data?.message || 'Invalid email or password.');
    }
  };

  const sendOtp = async (identifier: string): Promise<{ success: boolean; message: string; demoOtp?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      throw new Error('Please enter your email or username');
    }

    try {
      const response = await apiClient.post('/auth/send-otp', { identifier: cleanId });
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || `OTP sent to ${cleanId}`,
          demoOtp: response.data.data?.previewOtp || '123456',
        };
      }
    } catch (apiError: any) {
      // If backend is unreachable or 404, fallback cleanly for demo mode
      if (!apiError.response || apiError.response.status === 404 || apiError.code === 'ERR_NETWORK') {
        return {
          success: true,
          message: `Verification code sent to ${cleanId}`,
          demoOtp: '123456',
        };
      }

      throw new Error(apiError.response?.data?.message || 'Failed to send OTP. Please check your email.');
    }

    return {
      success: true,
      message: `OTP sent to ${cleanId}`,
      demoOtp: '123456',
    };
  };

  const loginWithOtp = async (identifier: string, otp: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      throw new Error('Please enter the OTP code');
    }

    try {
      const response = await apiClient.post('/auth/verify-otp', { identifier: cleanId, otp: cleanOtp });
      if (response.data?.success) {
        const { user: loggedInUser, school: loggedInSchool, tokens } = response.data.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.removeItem('isMockAuth');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockSchool');
        setUser(loggedInUser);
        setSchool(loggedInSchool);
        return;
      }
    } catch (apiError: any) {
      // If backend explicitly rejected OTP
      if (apiError.response?.status === 401 && apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }

      // Offline / fallback mode
      const isValidDemoOtp = cleanOtp === '123456' || cleanOtp === '1234';
      if (!isValidDemoOtp) {
        throw new Error('Invalid OTP code. Use code 123456.');
      }

      const demoAccount = DEMO_ACCOUNTS[cleanId];
      if (demoAccount) {
        localStorage.setItem('accessToken', 'mock-demo-token');
        localStorage.setItem('refreshToken', 'mock-demo-refresh-token');
        localStorage.setItem('isMockAuth', 'true');
        localStorage.setItem('mockUser', JSON.stringify(demoAccount.user));
        localStorage.setItem('mockSchool', JSON.stringify(demoAccount.school));
        setUser(demoAccount.user);
        setSchool(demoAccount.school);
        return;
      }

      const isSuper = cleanId.includes('super');
      const isTeacher = cleanId.includes('teacher');
      const assignedRole = isSuper ? 'SUPER_ADMIN' : isTeacher ? 'TEACHER' : 'SCHOOL_ADMIN';

      const teacherPermissions = [
        'students.view',
        'attendance.view',
        'attendance.mark',
        'academics.view',
        'exams.marks.enter',
        'exams.view',
      ];

      const schoolAdminPermissions = [
        'schools.view',
        'users.view',
        'users.create',
        'users.update',
        'users.activate',
        'staff.view',
        'staff.create',
        'staff.update',
        'staff.delete',
        'teachers.view',
        'teachers.create',
        'teachers.update',
        'teachers.delete',
        'students.view',
        'students.create',
        'students.update',
        'students.delete',
        'parents.view',
        'parents.create',
        'parents.update',
        'parents.delete',
        'attendance.view',
        'attendance.mark',
        'attendance.update',
        'fees.view',
        'fees.create',
        'fees.collect',
        'fees.refund',
        'transport.view',
        'transport.manage',
        'transport.track',
        'academics.manage',
        'academics.view',
        'exams.manage',
        'exams.marks.enter',
        'exams.view',
      ];

      const genericUser: User = {
        _id: 'user-' + assignedRole.toLowerCase() + '-' + Date.now(),
        name: cleanId.split('@')[0].replace('.', ' ').toUpperCase(),
        email: cleanId,
        role: assignedRole,
        permissions: isSuper ? ['*'] : isTeacher ? teacherPermissions : schoolAdminPermissions,
      };

      localStorage.setItem('accessToken', 'mock-demo-token');
      localStorage.setItem('refreshToken', 'mock-demo-refresh-token');
      localStorage.setItem('isMockAuth', 'true');
      localStorage.setItem('mockUser', JSON.stringify(genericUser));
      setUser(genericUser);
      setSchool(null);
      return;
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('isMockAuth') !== 'true') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await apiClient.post('/auth/logout', { refreshToken });
        }
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isMockAuth');
      localStorage.removeItem('mockUser');
      localStorage.removeItem('mockSchool');
      setUser(null);
      setSchool(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        isAuthenticated: !!user,
        isLoading,
        login,
        sendOtp,
        loginWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
