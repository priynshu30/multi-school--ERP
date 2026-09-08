import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { apiClient } from '../lib/apiClient';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const HomeworkPage: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Filter
  const [classFilter, setClassFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/academics/classes');
      if (res.data.success) {
        setClasses(res.data.data);
        if (res.data.data.length > 0 && !form.classId) {
          setForm((prev) => ({ ...prev, classId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const res = await apiClient.get(`/academics/subjects?classId=${classId}`);
      if (res.data.success) {
        setSubjects(res.data.data);
        if (res.data.data.length > 0) {
          setForm((prev) => ({ ...prev, subjectId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (classFilter) params.classId = classFilter;
      const res = await apiClient.get('/homework', { params });
      if (res.data.success) {
        setHomeworkList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load homework', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (form.classId) {
      fetchSubjects(form.classId);
    }
  }, [form.classId]);

  useEffect(() => {
    fetchHomework();
  }, [classFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/homework', form);
      if (res.data.success) {
        setToastMessage(`Homework "${form.title}" published successfully!`);
        setIsModalOpen(false);
        setForm({
          title: '',
          description: '',
          classId: classes[0]?._id || '',
          subjectId: '',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchHomework();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create homework');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/homework/${id}`);
      fetchHomework();
    } catch (err) {
      console.error('Failed to delete homework', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Homework & Assignments</h1>
            <Badge variant="info">{homeworkList.length} Active</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Publish coursework, set due dates, and track student submission completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHomework}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Assign Homework
          </Button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button className="text-emerald-700 font-bold ml-4" onClick={() => setToastMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-subtle">
        <Select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 text-xs w-48"
          options={[
            { value: '', label: 'All Classes' },
            ...classes.map((c) => ({ value: c._id, label: c.name })),
          ]}
        />
      </div>

      {/* Homework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {homeworkList.map((hw) => (
          <div
            key={hw._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                    {hw.classId?.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{hw.subjectId?.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(hw._id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1.5">{hw.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">{hw.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-amber-600 font-medium text-[11px]">
                <Clock className="w-3.5 h-3.5" /> Due: {new Date(hw.dueDate).toLocaleDateString()}
              </span>
              <span className="text-slate-400 text-[11px]">
                {hw.submissions?.length || 0} Submissions
              </span>
            </div>
          </div>
        ))}

        {homeworkList.length === 0 && (
          <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
            No active homework assignments found for this filter.
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Homework" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class *"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select
              label="Subject *"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              options={subjects.map((s) => ({ value: s._id, label: s.name }))}
            />
          </div>

          <Input
            label="Homework Title *"
            required
            placeholder="e.g. Chapter 4 Exercise 4.2 Questions 1-10"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            label="Instructions / Description *"
            required
            rows={4}
            placeholder="Provide guidelines, references, and problems to complete..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            label="Submission Due Date *"
            type="date"
            required
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
