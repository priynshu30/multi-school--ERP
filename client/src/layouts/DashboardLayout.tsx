import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { apiClient } from '../lib/apiClient';
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Bus,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Shield,
  Bell,
  Search,
  BookOpen,
  Calendar,
  Megaphone,
  CheckCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { user, school, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success && res.data.data.length > 0) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n: any) => !n.isRead).length);
      } else {
        // Sample notifications for demo
        setNotifications([
          {
            _id: '1',
            title: 'Fee Invoice Generated',
            message: 'Quarterly tuition fees for Grade 5 have been generated.',
            type: 'FEE',
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/fees',
          },
          {
            _id: '2',
            title: 'Live Bus Radar Active',
            message: 'Bus-01 has started morning pickup route on North Campus Express.',
            type: 'TRANSPORT',
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            link: '/transport',
          },
          {
            _id: '3',
            title: 'Term Examination Schedule',
            message: 'Final term date sheet has been published for Grade 5.',
            type: 'EXAM',
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            link: '/exams',
          },
        ]);
        setUnreadCount(2);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await apiClient.patch(`/notifications/${notif._id}/read`);
      } catch {
        // ignore
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems: Array<{ label: string; path: string; icon: any; badge?: string }> = isSuperAdmin
    ? [
        { label: 'Platform Overview', path: '/super-admin', icon: LayoutDashboard },
        { label: 'Manage Schools', path: '/schools', icon: Building2 },
        { label: 'User Accounts', path: '/users', icon: Users },
        { label: 'Global Audit Logs', path: '/super-admin/audit', icon: Shield },
        { label: 'System Settings', path: '/super-admin/settings', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Students', path: '/students', icon: GraduationCap },
        { label: 'Parents', path: '/parents', icon: Users },
        { label: 'Teachers', path: '/teachers', icon: UserCog },
        { label: 'Staff', path: '/staff', icon: UserCog },
        { label: 'User Accounts', path: '/users', icon: Users },
        { label: 'Academics', path: '/academics', icon: GraduationCap },
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { label: 'Fees & Accounts', path: '/fees', icon: CreditCard },
        { label: 'Exams & Results', path: '/exams', icon: FileText },
        { label: 'Homework', path: '/homework', icon: BookOpen },
        { label: 'Timetable', path: '/timetable', icon: Calendar },
        { label: 'Notices', path: '/notices', icon: Megaphone },
        { label: 'Transport & GPS', path: '/transport', icon: Bus },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Settings', path: '/settings', icon: Settings },
      ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'
        )}
      >
        {/* Brand / School Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {isSuperAdmin ? '⚡' : school?.name ? school.name.charAt(0) : 'E'}
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {isSuperAdmin ? 'EduScale SuperAdmin' : school?.name || 'School Portal'}
              </h1>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                {isSuperAdmin ? 'Multi-School SaaS Hub' : school?.code || 'Tenant Active'}
              </span>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Active Indicator */}
        {!isSuperAdmin && school && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100/80">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active School
              </span>
              <Badge variant="info" size="sm">
                {school.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-2">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <Badge variant={isSuperAdmin ? 'danger' : 'info'} size="sm">
                {user?.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-lg border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Tenant Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Multi-School ERP</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800">
                {isSuperAdmin ? 'System Administration' : school?.name}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-400 gap-2 w-56 border border-slate-200/50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search (Ctrl+K)...</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <Badge variant="info" size="sm">
                            {unreadCount} New
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={clsx(
                            'p-3.5 text-left cursor-pointer transition-colors hover:bg-slate-50',
                            !notif.isRead ? 'bg-brand-50/30' : 'bg-white'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-xs italic">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
