import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { apiClient } from '../lib/apiClient';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Link,
  AlertCircle,
} from 'lucide-react';

interface Parent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  occupation?: string;
  relation: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  photo?: string;
  children: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  }>;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export const ParentsPage: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Link Child Modal
  const [isLinkChildModalOpen, setIsLinkChildModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  // Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    occupation: '',
    address: '',
    relation: 'GUARDIAN',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');

  const fetchParents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const res = await apiClient.get('/parents', { params });
      if (res.data.success) {
        setParents(res.data.data);
        if (res.data.pagination) {
          setTotal(res.data.pagination.total);
        }
      }
    } catch (err: any) {
      console.error('Failed to load parents', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/students?limit=100');
      if (res.data.success) setAllStudents(res.data.data);
    } catch (err) {
      console.error('Failed to load students for linking', err);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchParents();
  };

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Parent) => {
    setSelectedParent(p);
    setFormData({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      phone: p.phone || '',
      alternatePhone: p.alternatePhone || '',
      occupation: p.occupation || '',
      address: p.address || '',
      relation: p.relation || 'GUARDIAN',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (isEditModalOpen && selectedParent) {
        await apiClient.patch(`/parents/${selectedParent._id}`, formData);
      } else {
        await apiClient.post('/parents', formData);
      }

      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      fetchParents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save parent details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent || !selectedChildId) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/parents/${selectedParent._id}/link-child`, {
        studentId: selectedChildId,
      });
      setIsLinkChildModalOpen(false);
      setSelectedChildId('');
      fetchParents();
    } catch (err: any) {
      console.error('Link child error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    try {
      await apiClient.delete(`/parents/${parentId}/unlink-child/${studentId}`);
      fetchParents();
      if (selectedParent && selectedParent._id === parentId) {
        setSelectedParent((prev) =>
          prev
            ? {
                ...prev,
                children: prev.children.filter((c) => c._id !== studentId),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Unlink child error', err);
    }
  };

  const handleDelete = async () => {
    if (!parentToDelete) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/parents/${parentToDelete._id}`);
      setIsDeleteModalOpen(false);
      setParentToDelete(null);
      fetchParents();
    } catch (err: any) {
      console.error('Delete parent failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Parent>[] = [
    {
      key: 'parent',
      header: 'Parent / Guardian',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${p.firstName} ${p.lastName}`} src={p.photo} size="md" />
          <div>
            <div className="font-semibold text-slate-900">
              {p.firstName} {p.lastName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="capitalize">{p.relation.toLowerCase()}</span>
              {p.occupation && <span>• {p.occupation}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (p) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{p.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{p.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'children',
      header: 'Children Enrolled',
      render: (p) => (
        <div>
          {p.children && p.children.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {p.children.map((c) => (
                <span
                  key={c._id}
                  className="bg-brand-50 text-brand-700 font-medium px-2 py-0.5 rounded text-[11px] border border-brand-100 flex items-center gap-1"
                >
                  <GraduationCap className="w-3 h-3" />
                  {c.firstName} {c.lastName}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] italic">No children linked</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'danger'}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-brand-600"
            title="Link Student"
            onClick={() => {
              setSelectedParent(p);
              setIsLinkChildModalOpen(true);
            }}
          >
            <Link className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-slate-800"
            onClick={() => {
              setSelectedParent(p);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-brand-600"
            onClick={() => handleOpenEdit(p)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-rose-600"
            onClick={() => {
              setParentToDelete(p);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Parent Directory</h1>
            <Badge variant="info">{total} Parents</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Maintain parent and guardian contact records and link them with enrolled students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParents}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Parent
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-subtle">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search parents by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={parents}
        loading={loading}
        emptyTitle="No parents found"
        emptyDescription="Register parents to link them with students and enable parent communications."
        emptyIcon={<Users className="w-10 h-10 text-slate-300" />}
        pagination={{
          page,
          limit: 10,
          total,
          totalPages: Math.ceil(total / 10) || 1,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Add / Edit Parent Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Parent Information' : 'Register New Parent'}
        size="md"
      >
        <form onSubmit={handleSaveParent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
            />
            <Input
              label="Last Name *"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="parent@example.com"
            />
            <Input
              label="Primary Phone *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Relationship"
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value as any })}
              options={[
                { value: 'FATHER', label: 'Father' },
                { value: 'MOTHER', label: 'Mother' },
                { value: 'GUARDIAN', label: 'Guardian' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
            <Input
              label="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="e.g. Engineer, Business"
            />
          </div>

          <Input
            label="Residential Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, city, pin code"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {isEditModalOpen ? 'Save Changes' : 'Register Parent'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link Child Modal */}
      <Modal
        isOpen={isLinkChildModalOpen}
        onClose={() => setIsLinkChildModalOpen(false)}
        title={`Link Student to ${selectedParent?.firstName} ${selectedParent?.lastName}`}
        size="sm"
      >
        <form onSubmit={handleLinkChild} className="space-y-4">
          <Select
            label="Select Student to Link"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            options={[
              { value: '', label: 'Select a student...' },
              ...allStudents.map((s) => ({
                value: s._id,
                label: `${s.firstName} ${s.lastName} (Adm: ${s.admissionNumber})`,
              })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsLinkChildModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!selectedChildId}
              isLoading={submitting}
            >
              Link Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Parent Detail Modal */}
      {selectedParent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Parent Profile"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Avatar
                name={`${selectedParent.firstName} ${selectedParent.lastName}`}
                src={selectedParent.photo}
                size="lg"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedParent.firstName} {selectedParent.lastName}
                </h3>
                <p className="text-xs text-slate-500 capitalize">
                  {selectedParent.relation.toLowerCase()} • {selectedParent.occupation || 'Self-employed'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{selectedParent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedParent.email}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  Linked Students ({selectedParent.children?.length || 0})
                </h4>
                {selectedParent.children && selectedParent.children.length > 0 ? (
                  <div className="space-y-2">
                    {selectedParent.children.map((c) => (
                      <div
                        key={c._id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Adm No: {c.admissionNumber}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:text-rose-700 text-xs h-6 px-2"
                          onClick={() => handleUnlinkChild(selectedParent._id, c._id)}
                        >
                          Unlink
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">No students currently linked.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Parent Record"
        message={`Are you sure you want to delete ${parentToDelete?.firstName} ${parentToDelete?.lastName}? They will be unlinked from any assigned students.`}
        confirmText="Yes, Delete"
        isLoading={submitting}
      />
    </div>
  );
};
