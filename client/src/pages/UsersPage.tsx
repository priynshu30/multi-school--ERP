import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, UserX,
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/authContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/ui/StatCard';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  schoolId?: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'danger',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-rose-100 text-rose-700',
  SCHOOL_ADMIN: 'bg-brand-100 text-brand-700',
  TEACHER: 'bg-indigo-100 text-indigo-700',
  STAFF: 'bg-violet-100 text-violet-700',
  PARENT: 'bg-emerald-100 text-emerald-700',
  STUDENT: 'bg-amber-100 text-amber-700',
};

const INITIAL_FORM = {
  name: '', email: '', password: '', phone: '',
  role: 'STAFF', schoolId: '', status: 'ACTIVE',
};

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload: any = { ...formData };
      if (!isSuperAdmin) delete payload.schoolId;
      await apiClient.post('/users', payload);
      setCreateOpen(false);
      setFormData(INITIAL_FORM);
      fetchUsers(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id: string, action: 'activate' | 'deactivate') => {
    try {
      await apiClient.post(`/users/${id}/${action}`);
      fetchUsers(pagination.page);
    } catch (e) { console.error(e); }
  };

  const updateForm = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;

  const roleOptions = isSuperAdmin
    ? [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'SCHOOL_ADMIN', label: 'School Admin' },
        { value: 'TEACHER', label: 'Teacher' },
        { value: 'STAFF', label: 'Staff' },
      ]
    : [
        { value: 'SCHOOL_ADMIN', label: 'School Admin' },
        { value: 'TEACHER', label: 'Teacher' },
        { value: 'STAFF', label: 'Staff' },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            User Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin ? 'All platform user accounts across tenants' : 'User accounts scoped to your school'}
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setCreateOpen(true); setError(''); setFormData(INITIAL_FORM); }}>
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={String(pagination.total)} icon={<Users className="w-5 h-5" />} iconBgColor="bg-brand-50 text-brand-600" subtitle="All accounts" />
        <StatCard title="Active" value={String(activeCount)} icon={<CheckCircle2 className="w-5 h-5" />} iconBgColor="bg-emerald-50 text-emerald-600" subtitle="Logged in" isPositive />
        <StatCard title="Inactive" value={String(pagination.total - activeCount)} icon={<XCircle className="w-5 h-5" />} iconBgColor="bg-slate-100 text-slate-500" subtitle="Disabled" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
        </div>
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
            { value: 'SCHOOL_ADMIN', label: 'School Admin' },
            { value: 'TEACHER', label: 'Teacher' },
            { value: 'STAFF', label: 'Staff' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-44"
        />
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'SUSPENDED', label: 'Suspended' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44"
        />
        <Button variant="outline" size="sm" onClick={() => fetchUsers(1)} isLoading={loading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <Badge variant="info">{pagination.total} Users</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400"><UserX className="w-8 h-8 mx-auto mb-2 opacity-30" />No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4"><Badge variant={STATUS_VARIANTS[u.status] || 'info'} size="sm">{u.status}</Badge></td>
                  <td className="py-4 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(u._id, 'deactivate')}>Deactivate</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(u._id, 'activate')}>Activate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex items-center gap-1">
              <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setError(''); }} title="Create User Account" subtitle="Provision a new login account" size="md"
        footer={<><Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreate as any}>Create User</Button></>}>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">{error}</div>}
          <Input label="Full Name" required value={formData.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Full name" />
          <Input label="Email Address" type="email" required value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="user@school.edu" />
          <Input label="Password" type="password" required value={formData.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 8 characters" />
          <Input label="Phone" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
          <Select label="Role" required value={formData.role} onChange={(e) => updateForm('role', e.target.value)} options={roleOptions} />
          {isSuperAdmin && (
            <Input label="School ID (optional)" value={formData.schoolId} onChange={(e) => updateForm('schoolId', e.target.value)} placeholder="MongoDB ObjectId of school" helperText="Leave blank for platform-level accounts" />
          )}
        </form>
      </Modal>
    </div>
  );
};
