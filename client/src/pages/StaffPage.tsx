import React, { useEffect, useState, useCallback } from 'react';
import {
  UserCog, Plus, Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Edit2, Trash2,
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/ui/StatCard';

interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId: string;
  designation: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  joinDate: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
  ON_LEAVE: 'warning',
};

const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '', employeeId: '',
  designation: '', department: '', salary: '', joinDate: '',
  status: 'ACTIVE', createAccount: false, password: '',
};

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/staff', { params });
      if (res.data.success) {
        setStaff(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, deptFilter, statusFilter]);

  useEffect(() => { fetchStaff(1); }, [fetchStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload: any = { ...formData };
      if (!payload.createAccount) { delete payload.password; }
      payload.joiningDate = payload.joinDate || undefined;
      await apiClient.post('/staff', payload);
      setCreateOpen(false);
      setFormData(INITIAL_FORM);
      fetchStaff(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create staff member');
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaff) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.patch(`/staff/${editStaff._id}`, formData);
      setEditStaff(null);
      fetchStaff(pagination.page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update staff member');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/staff/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchStaff(pagination.page);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const openEdit = (s: StaffMember) => {
    setFormData({ ...INITIAL_FORM, firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone || '', employeeId: s.employeeId, designation: s.designation, department: s.department, status: s.status, joinDate: s.joinDate?.slice(0, 10) || '' });
    setEditStaff(s);
    setError('');
  };

  const updateForm = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const activeCount = staff.filter((s) => s.status === 'ACTIVE').length;
  const inactiveCount = staff.filter((s) => s.status === 'INACTIVE').length;

  const StaffForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" required value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} placeholder="John" />
        <Input label="Last Name" required value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} placeholder="Smith" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" required value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="john@school.edu" />
        <Input label="Phone" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Employee ID" required value={formData.employeeId} onChange={(e) => updateForm('employeeId', e.target.value)} placeholder="EMP001" />
        <Input label="Join Date" type="date" value={formData.joinDate} onChange={(e) => updateForm('joinDate', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Designation" required value={formData.designation} onChange={(e) => updateForm('designation', e.target.value)} placeholder="Accountant" />
        <Input label="Department" required value={formData.department} onChange={(e) => updateForm('department', e.target.value)} placeholder="Finance" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Salary (₹)" type="number" value={formData.salary} onChange={(e) => updateForm('salary', e.target.value)} placeholder="25000" />
        <Select label="Status" value={formData.status} onChange={(e) => updateForm('status', e.target.value)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_LEAVE', label: 'On Leave' }]} />
      </div>
      {title.includes('Add') && (
        <div className="border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.createAccount} onChange={(e) => updateForm('createAccount', e.target.checked)} className="rounded" />
            <span className="text-xs font-semibold text-slate-700">Create login account for this staff</span>
          </label>
          {formData.createAccount && (
            <div className="mt-3">
              <Input label="Account Password" type="password" required value={formData.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Min 8 characters" />
            </div>
          )}
        </div>
      )}
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-brand-600" />
            Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage non-teaching staff members for your school</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setCreateOpen(true); setError(''); setFormData(INITIAL_FORM); }}>
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Staff" value={String(pagination.total)} icon={<UserCog className="w-5 h-5" />} iconBgColor="bg-brand-50 text-brand-600" subtitle="Enrolled" />
        <StatCard title="Active" value={String(activeCount)} icon={<CheckCircle2 className="w-5 h-5" />} iconBgColor="bg-emerald-50 text-emerald-600" subtitle="Currently working" isPositive />
        <StatCard title="Inactive" value={String(inactiveCount)} icon={<XCircle className="w-5 h-5" />} iconBgColor="bg-rose-50 text-rose-600" subtitle="Not working" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search by name, employee ID, designation…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
        </div>
        <Input placeholder="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="sm:w-40" />
        <Select options={[{ value: '', label: 'All Statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_LEAVE', label: 'On Leave' }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40" />
        <Button variant="outline" size="sm" onClick={() => fetchStaff(1)} isLoading={loading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh</Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <Badge variant="info">{pagination.total} Members</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400"><UserCog className="w-8 h-8 mx-auto mb-2 opacity-30" />No staff found</td></tr>
              ) : staff.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs border border-violet-200">
                        {s.firstName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{s.firstName} {s.lastName}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{s.employeeId}</span></td>
                  <td className="py-4 px-4 text-slate-700">{s.designation}</td>
                  <td className="py-4 px-4 text-slate-600">{s.department}</td>
                  <td className="py-4 px-4"><Badge variant={STATUS_VARIANTS[s.status] || 'info'} size="sm">{s.status}</Badge></td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(s)}>Edit</Button>
                      <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              <button disabled={pagination.page <= 1} onClick={() => fetchStaff(pagination.page - 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchStaff(pagination.page + 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setError(''); }} title="Add New Staff Member" subtitle="All staff are scoped to your school" size="lg"
        footer={<><Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreate as any}>Add Staff</Button></>}>
        <StaffForm onSubmit={handleCreate} title="Add Staff" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStaff} onClose={() => { setEditStaff(null); setError(''); }} title="Edit Staff Member" size="lg"
        footer={<><Button variant="outline" size="sm" onClick={() => setEditStaff(null)}>Cancel</Button><Button variant="primary" size="sm" isLoading={submitting} onClick={handleUpdate as any}>Save Changes</Button></>}>
        <StaffForm onSubmit={handleUpdate} title="Edit Staff" />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Staff Member?" size="sm"
        footer={<><Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" size="sm" isLoading={submitting} onClick={handleDelete}>Yes, Delete</Button></>}>
        <p className="text-sm text-slate-600">This will permanently delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> and deactivate their account. This action cannot be undone.</p>
      </Modal>
    </div>
  );
};
