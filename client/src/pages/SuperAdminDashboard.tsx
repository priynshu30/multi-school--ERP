import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/apiClient';
import {
  Building2,
  Users,
  Layers,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  BrainCircuit,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface SchoolItem {
  _id: string;
  name: string;
  code: string;
  slug: string;
  email: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'ARCHIVED';
  planId: string;
  createdAt: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/schools');
      if (res.data.success) {
        setSchools(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load schools:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              SaaS Multi-School Platform Hub
            </h2>
            <Badge variant="danger" size="sm">
              SUPER ADMIN
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            System-wide administration, tenant onboarding, and platform health telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchools}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Provision New School
          </Button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Schools"
          value={schools.length.toString()}
          change="+2 new"
          isPositive={true}
          subtitle="All onboarded tenants"
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />

        <StatCard
          title="Active Subscriptions"
          value={schools.filter((s) => s.status === 'ACTIVE').length.toString()}
          change="100% active"
          isPositive={true}
          subtitle="Zero delinquent accounts"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Total Students (Global)"
          value="2,480"
          change="+12.5%"
          isPositive={true}
          subtitle="Combined tenant population"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Monthly Platform ARR"
          value="₹4,20,000"
          change="+15.0%"
          isPositive={true}
          subtitle="Recurring SaaS license fees"
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* AI Trends Overview */}
      <Card className="bg-gradient-to-r from-violet-50 via-white to-cyan-50 border-violet-100">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-violet-600" />
              AI Trends Overview
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Platform-wide automation and predictive insight growth</p>
          </div>
          <Badge variant="info" className="bg-violet-100 text-violet-700 border-violet-200">
            +18.4% QoQ
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'AI Automation', value: '86%', change: '+14%' },
              { label: 'Predictive Accuracy', value: '92%', change: '+8%' },
              { label: 'Smart Alerts', value: '79%', change: '+11%' },
              { label: 'Ops Efficiency', value: '89%', change: '+16%' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.label}</span>
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                  <span className="text-[11px] font-semibold text-emerald-600">{item.change}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: item.value }} />
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  Insight synced
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schools Directory Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Tenant Directory</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolated tenant instances running on this multi-school ERP cluster
            </p>
          </div>
          <Badge variant="info">{schools.length} Institutions</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">School Name</th>
                <th className="py-3 px-4">Code / Slug</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Tenant Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {schools.map((sch) => (
                <tr key={sch._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {sch.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold">{sch.name}</div>
                        <div className="text-[11px] text-slate-400">{sch.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {sch.code}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{sch.city}</td>
                  <td className="py-4 px-4">
                    <span className="capitalize font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {sch.planId}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={sch.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {sch.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
