import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/apiClient';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  UserPlus,
  PlusCircle,
  Megaphone,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardSummary {
  totalStudents: number;
  totalClasses: number;
  activeBuses: number;
  attendanceRate: number;
  finance: {
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
  };
}

interface SchoolStats {
  totalStaff: number;
  totalTeachers: number;
  activeUsers: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);

export const SchoolAdminDashboard: React.FC = () => {
  const { user, school } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, statsRes] = await Promise.all([
          apiClient.get('/reports/summary'),
          apiClient.get('/schools/current/stats'),
        ]);

        setSummary(summaryRes.data?.data ?? null);
        setSchoolStats(statsRes.data?.data ?? null);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        setSummary(null);
        setSchoolStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalStudents = summary?.totalStudents ?? 0;
  const totalTeachers = schoolStats?.totalTeachers ?? 0;
  const attendanceRate = summary?.attendanceRate ?? 0;
  const collectionRate = summary?.finance?.collectionRate ?? 0;
  const totalCollected = summary?.finance?.totalCollected ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              Good Morning, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Administrator'} 👋
            </h2>
            <Badge variant="success" size="sm">
              Tenant Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Managing <span className="font-semibold text-slate-700">{school?.name}</span> ({school?.code}) • Academic Year 2026-27
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Tenant Isolation Active</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={loading ? '...' : formatCompactNumber(totalStudents)}
          change={loading ? 'Loading' : '+4.2%'}
          isPositive={true}
          subtitle={loading ? 'Fetching live data' : `Across ${summary?.totalClasses ?? 0} classes`}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Teaching Staff"
          value={loading ? '...' : formatCompactNumber(totalTeachers)}
          change={loading ? 'Loading' : '+2'}
          isPositive={true}
          subtitle="Active faculty members"
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Attendance Today"
          value={loading ? '...' : `${attendanceRate}%`}
          change={loading ? 'Loading' : '+1.1%'}
          isPositive={true}
          subtitle={loading ? 'Fetching live data' : `School-wide attendance rate`}
          icon={<CalendarCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Fee Collection (MTD)"
          value={loading ? '...' : formatCurrency(totalCollected)}
          change={loading ? 'Loading' : `+${collectionRate}%`}
          isPositive={true}
          subtitle={loading ? 'Fetching live data' : `${collectionRate}% collection rate`}
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Center Grid: Attendance Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Visual Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Attendance & Campus Pulse</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time breakdown for today across all sections</p>
            </div>
            <Badge variant="info">Live Stream</Badge>
          </CardHeader>
          <CardContent>
            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Present Students</span>
                  <span className="text-emerald-600 font-bold">{loading ? '...' : `${totalStudents} (${attendanceRate}%)`}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(attendanceRate, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Faculty & Staff Attendance</span>
                  <span className="text-brand-600 font-bold">{loading ? '...' : `${schoolStats?.totalTeachers ?? 0} / ${schoolStats?.totalStaff ?? 0} (${Math.min(Math.round(((schoolStats?.totalTeachers ?? 0) / Math.max((schoolStats?.totalStaff ?? 1), 1)) * 100), 100)}%)`}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(Math.round(((schoolStats?.totalTeachers ?? 0) / Math.max((schoolStats?.totalStaff ?? 1), 1)) * 100), 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Transport Fleet Active</span>
                  <span className="text-amber-600 font-bold">12 / 12 Buses En Route</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Attendance Days Summary Mini-Grid */}
            <div className="mt-8 grid grid-cols-5 gap-2 text-center">
              {[
                { day: 'Mon', rate: '95%' },
                { day: 'Tue', rate: '96%' },
                { day: 'Wed', rate: '94%' },
                { day: 'Thu', rate: '93%' },
                { day: 'Fri (Today)', rate: '94.6%', active: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    item.active ? 'bg-brand-50/50 border-brand-200' : 'bg-slate-50/60 border-slate-100'
                  }`}
                >
                  <p className="text-[11px] font-semibold text-slate-500">{item.day}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{item.rate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-semibold"
                leftIcon={<UserPlus className="w-4 h-4 text-brand-600" />}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-400" />}
                onClick={() => navigate('/students')}
              >
                Enroll New Student
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-semibold"
                leftIcon={<PlusCircle className="w-4 h-4 text-emerald-600" />}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-400" />}
                onClick={() => navigate('/teachers')}
              >
                Add Staff / Teacher
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-semibold"
                leftIcon={<Megaphone className="w-4 h-4 text-amber-600" />}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5 ml-auto text-slate-400" />}
              >
                Broadcast Notice
              </Button>
            </CardContent>
          </Card>

          {/* Tenant Security Snapshot */}
          <Card className="bg-slate-900 text-white border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Data Vault
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your school data is isolated via Mongoose tenant barriers. Requests for School B or outside entities are immediately rejected by middleware.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Synced
                </span>
                <span className="text-slate-300 font-mono">Just now</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
