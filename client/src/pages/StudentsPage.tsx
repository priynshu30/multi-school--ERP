import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tabs } from '../components/ui/Tabs';
import { apiClient } from '../lib/apiClient';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface Student {
  _id: string;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  photo?: string;
  email?: string;
  phone?: string;
  address?: string;
  classId?: { _id: string; name: string };
  sectionId?: { _id: string; name: string };
  academicYear?: string;
  parentId?: { _id: string; firstName: string; lastName: string; phone: string; email: string };
  status: 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'TRANSFERRED';
  createdAt: string;
}

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Dropdown data
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);

  // Modals & Details
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    admissionNumber: '',
    rollNumber: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    bloodGroup: '',
    email: '',
    phone: '',
    address: '',
    classId: '',
    sectionId: '',
    parentId: '',
    academicYear: '2026-2027',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.classId = classFilter;

      const res = await apiClient.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.pagination) {
          setTotal(res.data.pagination.total);
        }
      }
    } catch (err: any) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [classRes, parentRes] = await Promise.all([
        apiClient.get('/academics/classes'),
        apiClient.get('/parents?limit=100'),
      ]);
      if (classRes.data.success) setClasses(classRes.data.data);
      if (parentRes.data.success) setParents(parentRes.data.data);
    } catch (err) {
      console.error('Failed to load classes or parents metadata', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter, classFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClassChange = async (classId: string) => {
    setFormData((prev) => ({ ...prev, classId, sectionId: '' }));
    if (classId) {
      try {
        const res = await apiClient.get(`/academics/sections?classId=${classId}`);
        if (res.data.success) setSections(res.data.data);
      } catch (err) {
        console.error('Failed to load sections', err);
      }
    } else {
      setSections([]);
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = async (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      admissionNumber: student.admissionNumber || '',
      rollNumber: student.rollNumber || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      gender: student.gender || 'MALE',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      bloodGroup: student.bloodGroup || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      classId: student.classId?._id || '',
      sectionId: student.sectionId?._id || '',
      parentId: student.parentId?._id || '',
      academicYear: student.academicYear || '2026-2027',
    });

    if (student.classId?._id) {
      try {
        const res = await apiClient.get(`/academics/sections?classId=${student.classId._id}`);
        if (res.data.success) setSections(res.data.data);
      } catch (err) {
        console.error('Failed to load sections', err);
      }
    }
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        classId: formData.classId || undefined,
        sectionId: formData.sectionId || undefined,
        parentId: formData.parentId || undefined,
      };

      if (isEditModalOpen && selectedStudent) {
        await apiClient.patch(`/students/${selectedStudent._id}`, payload);
      } else {
        await apiClient.post('/students', payload);
      }

      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save student details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`/students/${studentToDelete._id}`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      console.error('Delete student failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${s.firstName} ${s.lastName}`} src={s.photo} size="md" />
          <div>
            <div className="font-semibold text-slate-900">
              {s.firstName} {s.lastName}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Adm: #{s.admissionNumber}</span>
              {s.rollNumber && <span>• Roll: {s.rollNumber}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class & Section',
      render: (s) => (
        <div>
          <span className="font-medium text-slate-800">
            {s.classId?.name || 'Unassigned'}
          </span>
          {s.sectionId && (
            <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
              ({s.sectionId.name})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent / Guardian',
      render: (s) =>
        s.parentId ? (
          <div>
            <div className="text-slate-800 font-medium">
              {s.parentId.firstName} {s.parentId.lastName}
            </div>
            <div className="text-[11px] text-slate-500">{s.parentId.phone}</div>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">Not Linked</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => {
        const variants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
          ACTIVE: 'success',
          INACTIVE: 'danger',
          ALUMNI: 'info',
          TRANSFERRED: 'warning',
        };
        return <Badge variant={variants[s.status] || 'info'}>{s.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-slate-800"
            onClick={() => {
              setSelectedStudent(s);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-brand-600"
            onClick={() => handleOpenEdit(s)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-rose-600"
            onClick={() => {
              setStudentToDelete(s);
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
            <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
            <Badge variant="info">{total} Students</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Manage student enrollments, academic assignments, and parent linkages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudents}
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
            New Admission
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, admission no, or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 text-xs w-36"
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map((c) => ({ value: c._id, label: c.name })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs w-32"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'ALUMNI', label: 'Alumni' },
              { value: 'TRANSFERRED', label: 'Transferred' },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyTitle="No students found"
        emptyDescription="Get started by admitting your first student or check your search criteria."
        emptyIcon={<GraduationCap className="w-10 h-10 text-slate-300" />}
        pagination={{
          page,
          limit: 10,
          total,
          totalPages: Math.ceil(total / 10) || 1,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Student Details' : 'Student Admission Form'}
        size="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admission Number *"
              required
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
              placeholder="e.g. ADM-2026-001"
            />
            <Input
              label="Roll Number"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              placeholder="e.g. 14"
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <Input
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              placeholder="e.g. O+, B+"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class"
              value={formData.classId}
              onChange={(e) => handleClassChange(e.target.value)}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Select
              label="Section"
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              disabled={!formData.classId}
              options={[
                { value: '', label: 'Select Section' },
                ...sections.map((s) => ({ value: s._id, label: s.name })),
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Parent / Guardian"
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              options={[
                { value: '', label: 'None (Link later)' },
                ...parents.map((p) => ({
                  value: p._id,
                  label: `${p.firstName} ${p.lastName} (${p.phone})`,
                })),
              ]}
            />
            <Input
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="2026-2027"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
            />
            <Input
              label="Emergency Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>

          <Input
            label="Home Address"
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
              {isEditModalOpen ? 'Save Changes' : 'Admit Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Student Profile"
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Avatar
                name={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                src={selectedStudent.photo}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <Badge variant="success">{selectedStudent.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admission No: <span className="font-semibold text-slate-700">{selectedStudent.admissionNumber}</span>{' '}
                  • Class: <span className="font-semibold text-slate-700">{selectedStudent.classId?.name || 'N/A'}</span>
                  {selectedStudent.sectionId && ` (${selectedStudent.sectionId.name})`}
                </p>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'parent', label: 'Parent / Contact', icon: <Phone className="w-3.5 h-3.5" /> },
              ]}
              activeTab={detailTab}
              onChange={setDetailTab}
            />

            {detailTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block mb-1">Gender</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.gender || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block mb-1">Date of Birth</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.dateOfBirth
                      ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                      : 'Not specified'}
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block mb-1">Blood Group</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.bloodGroup || 'Not recorded'}</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block mb-1">Academic Year</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.academicYear || '2026-2027'}</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg col-span-2">
                  <span className="text-slate-400 block mb-1">Home Address</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.address || 'No address provided'}</span>
                </div>
              </div>
            )}

            {detailTab === 'parent' && (
              <div className="space-y-3">
                {selectedStudent.parentId ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-slate-800 text-sm">
                      {selectedStudent.parentId.firstName} {selectedStudent.parentId.lastName}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedStudent.parentId.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedStudent.parentId.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl">
                    No parent or guardian linked to this student record.
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete ${studentToDelete?.firstName} ${studentToDelete?.lastName}? All associated academic links will be affected.`}
        confirmText="Yes, Delete"
        isLoading={submitting}
      />
    </div>
  );
};
