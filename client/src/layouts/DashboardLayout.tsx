import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { apiClient } from '../lib/apiClient';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  Layers,
  CalendarCheck,
  FileText,
  LineChart,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Shield,
  Bell,
  Search,
  BookOpen,
  Bus,
  CheckCheck,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../contexts/ThemeContext';

export const DashboardLayout: React.FC = () => {
  const { user, school, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    // Sample notifications matching ERP alerts
    setNotifications([
      {
        _id: '1',
        title: 'Fee Payment Received',
        message: 'Aarav Sharma (Class 10-A) quarterly tuition fee received.',
        type: 'FEE',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/fees',
      },
      {
        _id: '2',
        title: 'Attendance Alert',
        message: 'Today\'s overall attendance reached 92% across all sections.',
        type: 'ATTENDANCE',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        link: '/attendance',
      },
      {
        _id: '3',
        title: 'Term Examination Schedule',
        message: 'Upcoming Mid-Term datesheet published for Classes 8 to 12.',
        type: 'EXAM',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        link: '/exams',
      },
    ]);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
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

  // Determine role-based navigation so each user only sees authorized modules
  const userRole = user?.role?.toUpperCase() || 'SCHOOL_ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isTeacher = userRole === 'TEACHER';

  let primaryNavItems: Array<{ label: string; path: string; icon: any }> = [];
  let moreNavItems: Array<{ label: string; path: string; icon: any }> = [];

  if (isSuperAdmin) {
    primaryNavItems = [
      { label: 'Platform Overview', path: '/super-admin', icon: LayoutDashboard },
      { label: 'Manage Schools', path: '/schools', icon: Building2 },
      { label: 'User Accounts', path: '/users', icon: Users },
      { label: 'Global Audit Logs', path: '/super-admin/audit', icon: Shield },
      { label: 'System Settings', path: '/super-admin/settings', icon: Settings },
    ];
    moreNavItems = [];
  } else if (isTeacher) {
    // Teacher: Only pedagogical and classroom functions
    primaryNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/students', icon: Users },
      { label: 'Classes', path: '/academics', icon: Layers },
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
      { label: 'Examinations', path: '/exams', icon: FileText },
      { label: 'Homework', path: '/homework', icon: BookOpen },
      { label: 'Timetable', path: '/timetable', icon: Calendar },
      { label: 'Communication', path: '/notices', icon: MessageSquare },
    ];
    moreNavItems = [
      { label: 'Transport & GPS', path: '/transport', icon: Bus },
    ];
  } else {
    // School Admin / Principal: Full School Management Suite
    primaryNavItems = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/students', icon: Users },
      { label: 'Teachers', path: '/teachers', icon: UserCheck },
      { label: 'Classes', path: '/academics', icon: Layers },
      { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
      { label: 'Examinations', path: '/exams', icon: FileText },
      { label: 'Results', path: '/reports', icon: LineChart },
      { label: 'Timetable', path: '/timetable', icon: Calendar },
      { label: 'Fee Management', path: '/fees', icon: CreditCard },
      { label: 'Communication', path: '/notices', icon: MessageSquare },
      { label: 'Reports', path: '/reports', icon: BarChart3 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ];
    moreNavItems = [
      { label: 'Parents', path: '/parents', icon: Users },
      { label: 'Staff', path: '/staff', icon: UserCog },
      { label: 'Homework', path: '/homework', icon: BookOpen },
      { label: 'Transport & GPS', path: '/transport', icon: Bus },
      { label: 'User Accounts', path: '/users', icon: Users },
    ];
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.name || (isSuperAdmin ? 'Super Admin' : isTeacher ? 'Pooja Verma (Teacher)' : 'Priyanshu Kumar');
  const displayRole = user?.role ? user.role.replace('_', ' ') : 'Admin';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex antialiased font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= DARK NAVY SIDEBAR ================= */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0b1739] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 shadow-2xl select-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 sm:h-20 px-5 sm:px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                School <span className="text-blue-400">ERP</span>
              </span>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {primaryNavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && item.path !== '/super-admin' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Modules for School Admin / Teacher */}
          {moreNavItems.length > 0 && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Additional Modules
                </span>
              </div>

              {moreNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Quote Matching UI Mockup */}
        <div className="p-5 border-t border-slate-800/80 text-center bg-[#08122d]/60 select-none">
          <div className="w-9 h-9 mx-auto mb-2 rounded-full border border-slate-700/80 flex items-center justify-center text-blue-400 bg-blue-950/40">
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-300 font-serif italic tracking-wide">
            "Better Education"
          </p>
          <p className="text-[11px] text-slate-300 font-serif italic tracking-wide">
            "Builds a Brighter Future"
          </p>
          <div className="w-7 h-0.5 bg-blue-500 mx-auto mt-2.5 rounded-full" />
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Top Navbar */}
        <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-200">
          {/* Left: Mobile Menu & Search Input */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search students, teachers, classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right: Theme Toggle, Notifications & User Profile Chip */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Sun / Moon Light-Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 hover:text-blue-600 transition-transform -rotate-12 hover:rotate-0 duration-300" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <Badge variant="info" size="sm">
                            {unreadCount} New
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={clsx(
                            'p-3.5 text-left cursor-pointer transition-colors',
                            !notif.isRead
                              ? 'bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40'
                              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Profile Avatar & Name Chip matching mockup */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-[#0b1739] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20 shadow-sm overflow-hidden">
                {displayName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 capitalize">
                  {displayRole}
                </p>
              </div>

              {/* Quick Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
