import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2, Plus, Search, RefreshCw, Eye, CheckCircle2,
  PauseCircle, Archive, MoreVertical, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/ui/StatCard';

interface School {
  _id: string;
  name: string;
  code: string;
  slug: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  planId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'TRIAL';
  createdAt: string;
  staffCount?: number;
  teacherCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  SUSPENDED: 'danger',
  ARCHIVED: 'warning',
};

const INITIAL_FORM = {
  name: '', code: '', slug: '', email: '', phone: '',
  address: '', city: '', state: '', country: 'India',
  planId: 'starter', currency: 'INR',
  initialAdmin: { name: '', email: '', password: '', phone: '' },
};

export const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchSchools = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/schools', { params });
      if (res.data.success) {
        setSchools(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      // Offline/mock mode fallback: load from localStorage
      const isMock = localStorage.getItem('isMockAuth') === 'true';
      if (isMock) {
        const mockSchools = JSON.parse(localStorage.getItem('mockSchools') || '[]');
        setSchools(mockSchools);
        setPagination({ page: 1, limit: 10, total: mockSchools.length, totalPages: 1 });
        setStats({ total: mockSchools.length, active: mockSchools.filter((s: any) => s.status === 'ACTIVE').length, suspended: 0 });
      } else {
        console.error(e);
      }
    }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/schools/stats/platform');
      if (res.data.success) setStats(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchSchools(1);
    fetchStats();
  }, [fetchSchools]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (!formData.name.trim() || !formData.code.trim() || !formData.slug.trim() || !formData.email.trim()) {
      setError('School Name, Code, Slug and Email are required.');
      return;
    }
    if (!formData.phone.trim() || !formData.city.trim() || !formData.address.trim() || !formData.state.trim()) {
      setError('Phone, City, Address and State are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload: any = { ...formData };
      if (!payload.initialAdmin.email) delete payload.initialAdmin;

      const isMock = localStorage.getItem('isMockAuth') === 'true';
      if (isMock) {
        // Offline mode: save school to localStorage as mock data
        const mockSchool = {
          _id: 'mock-school-' + Date.now(),
          name: formData.name,
          code: formData.code.toUpperCase(),
          slug: formData.slug.toLowerCase(),
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          address: formData.address,
          planId: formData.planId,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          staffCount: 0,
          teacherCount: 0,
        };
        const existing = JSON.parse(localStorage.getItem('mockSchools') || '[]');
        existing.push(mockSchool);
        localStorage.setItem('mockSchools', JSON.stringify(existing));
        setSchools((prev) => [...prev, mockSchool]);
        setStats((prev) => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        setCreateOpen(false);
        setFormData(INITIAL_FORM);
        return;
      }

      await apiClient.post('/schools', payload);
      setCreateOpen(false);
      setFormData(INITIAL_FORM);
      fetchSchools(1);
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create school. Please check all required fields.');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id: string, action: 'activate' | 'suspend' | 'archive') => {
    try {
      await apiClient.post(`/schools/${id}/${action}`);
      setActionMenu(null);
      fetchSchools(pagination.page);
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const updateForm = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateAdmin = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, initialAdmin: { ...prev.initialAdmin, [field]: value } }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            School Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Provision and manage all tenant schools on the platform</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => { setCreateOpen(true); setError(''); }}
        >
          Add School
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Schools" value={String(stats.total)} icon={<Building2 className="w-5 h-5" />} iconBgColor="bg-brand-50 text-brand-600" subtitle="All tenants" />
        <StatCard title="Active" value={String(stats.active)} icon={<CheckCircle2 className="w-5 h-5" />} iconBgColor="bg-emerald-50 text-emerald-600" subtitle="Operational" isPositive />
        <StatCard title="Suspended" value={String(stats.suspended)} icon={<PauseCircle className="w-5 h-5" />} iconBgColor="bg-rose-50 text-rose-600" subtitle="Needs attention" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 py-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name, code, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'TRIAL', label: 'Trial' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-44"
            />
            <Button variant="outline" size="sm" onClick={() => fetchSchools(1)} isLoading={loading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools Directory</CardTitle>
          <Badge variant="info">{pagination.total} Total</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">School</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Staff / Teachers</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading schools…
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No schools found
                  </td>
                </tr>
              ) : (
                schools.map((sch) => (
                  <tr key={sch._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          {sch.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sch.name}</div>
                          <div className="text-[11px] text-slate-400">{sch.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{sch.code}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{sch.city || '—'}</td>
                    <td className="py-4 px-4">
                      <span className="capitalize font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{sch.planId}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {sch.staffCount ?? 0} / {sch.teacherCount ?? 0}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={STATUS_VARIANTS[sch.status] || 'info'} size="sm">{sch.status}</Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setViewSchool(sch)}>
                          View
                        </Button>
                        <div className="relative">
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setActionMenu(actionMenu === sch._id ? null : sch._id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionMenu === sch._id && (
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-10 min-w-36 py-1">
                              {sch.status !== 'ACTIVE' && (
                                <button className="w-full px-4 py-2 text-xs text-left text-emerald-700 hover:bg-emerald-50 flex items-center gap-2" onClick={() => handleStatusChange(sch._id, 'activate')}>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                                </button>
                              )}
                              {sch.status !== 'SUSPENDED' && (
                                <button className="w-full px-4 py-2 text-xs text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2" onClick={() => handleStatusChange(sch._id, 'suspend')}>
                                  <PauseCircle className="w-3.5 h-3.5" /> Suspend
                                </button>
                              )}
                              {sch.status !== 'ARCHIVED' && (
                                <button className="w-full px-4 py-2 text-xs text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2" onClick={() => handleStatusChange(sch._id, 'archive')}>
                                  <Archive className="w-3.5 h-3.5" /> Archive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSchools(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-700">{pagination.page} / {pagination.totalPages}</span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSchools(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Create School Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setFormData(INITIAL_FORM); setError(''); }}
        title="Provision New School"
        subtitle="Create a new tenant school on the platform"
        size="xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); setFormData(INITIAL_FORM); }}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreate as any}>Create School</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="School Name" required value={formData.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="e.g. Springfield Academy" />
            <Input label="School Code" required value={formData.code} onChange={(e) => updateForm('code', e.target.value)} placeholder="e.g. SA001" helperText="Short unique identifier" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="URL Slug" required value={formData.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="e.g. springfield-academy" />
            <Input label="Contact Email" type="email" required value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="admin@school.edu" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Phone" required value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" helperText="Min 7 digits" />
            <Input label="City" required value={formData.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="Mumbai" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Address" required value={formData.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="123, MG Road, Sector 5" />
            <Input label="State" required value={formData.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="Maharashtra" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Country" value={formData.country} onChange={(e) => updateForm('country', e.target.value)} placeholder="India" />
            <Select
              label="Plan"
              required
              value={formData.planId}
              onChange={(e) => updateForm('planId', e.target.value)}
              options={[
                { value: 'starter', label: 'Starter' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
            />
          </div>

          {/* Initial Admin section */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-700 mb-3">Initial School Admin (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Admin Name" value={formData.initialAdmin.name} onChange={(e) => updateAdmin('name', e.target.value)} placeholder="John Principal" />
              <Input label="Admin Email" type="email" value={formData.initialAdmin.email} onChange={(e) => updateAdmin('email', e.target.value)} placeholder="principal@school.edu" />
              <Input label="Admin Password" type="password" value={formData.initialAdmin.password} onChange={(e) => updateAdmin('password', e.target.value)} placeholder="Min 8 characters" />
              <Input label="Admin Phone" value={formData.initialAdmin.phone} onChange={(e) => updateAdmin('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </form>
      </Modal>

      {/* View School Modal */}
      <Modal
        isOpen={!!viewSchool}
        onClose={() => setViewSchool(null)}
        title={viewSchool?.name || ''}
        subtitle={`Code: ${viewSchool?.code || ''} · Slug: ${viewSchool?.slug || ''}`}
        size="md"
      >
        {viewSchool && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Email', viewSchool.email],
                ['Plan', viewSchool.planId],
                ['City', viewSchool.city || '—'],
                ['Status', viewSchool.status],
                ['Staff', String(viewSchool.staffCount ?? 0)],
                ['Teachers', String(viewSchool.teacherCount ?? 0)],
                ['Created', new Date(viewSchool.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase mb-1">{k}</div>
                  <div className="font-semibold text-slate-800">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
