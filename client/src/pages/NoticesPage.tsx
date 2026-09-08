import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { apiClient } from '../lib/apiClient';
import {
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Users,
  GraduationCap,
  UserCog,
  CalendarDays,
  Clock,
} from 'lucide-react';

type NoticeAudience = 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

interface Notice {
  _id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  priority: NoticePriority;
  startDate: string;
  endDate?: string;
  authorName: string;
  createdAt: string;
}

const AUDIENCE_CONFIG: Record<
  NoticeAudience,
  { label: string; icon: React.ReactNode; color: string }
> = {
  ALL: {
    label: 'All School',
    icon: <Megaphone className="w-3.5 h-3.5" />,
    color: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  TEACHERS: {
    label: 'Teachers',
    icon: <UserCog className="w-3.5 h-3.5" />,
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  PARENTS: {
    label: 'Parents',
    icon: <Users className="w-3.5 h-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  STUDENTS: {
    label: 'Students',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const PRIORITY_BADGE: Record<NoticePriority, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  LOW: { label: 'Low', variant: 'success' },
  NORMAL: { label: 'Normal', variant: 'info' },
  HIGH: { label: 'High', variant: 'warning' },
  URGENT: { label: 'Urgent', variant: 'danger' },
};

const defaultForm = {
  title: '',
  content: '',
  audience: 'ALL' as NoticeAudience,
  priority: 'NORMAL' as NoticePriority,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (audienceFilter) params.audience = audienceFilter;
      const res = await apiClient.get('/notices', { params });
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  }, [audienceFilter]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.endDate) delete payload.endDate;
      const res = await apiClient.post('/notices', payload);
      if (res.data.success) {
        setToastMessage(`Notice "${form.title}" published successfully!`);
        setIsModalOpen(false);
        setForm(defaultForm);
        fetchNotices();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setModalError(error.response?.data?.message || 'Failed to publish notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notice', err);
    }
  };

  const isActive = (notice: Notice) => {
    const now = new Date();
    const start = new Date(notice.startDate);
    if (notice.endDate) {
      return now >= start && now <= new Date(notice.endDate);
    }
    return now >= start;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Notices & Announcements</h1>
            <Badge variant="info">{notices.filter(isActive).length} Active</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Post school-wide announcements, event notices, and important updates to staff, parents,
            and students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotices}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setForm(defaultForm);
              setModalError('');
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post Notice
          </Button>
        </div>
      </div>

      {/* Toast */}
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 flex-wrap shadow-subtle">
        <Select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="h-9 text-xs w-44"
          options={[
            { value: '', label: 'All Audiences' },
            { value: 'ALL', label: 'All School' },
            { value: 'TEACHERS', label: 'Teachers' },
            { value: 'PARENTS', label: 'Parents' },
            { value: 'STUDENTS', label: 'Students' },
          ]}
        />
        <div className="text-xs text-slate-400">
          {notices.length} notice{notices.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((notice) => {
          const audienceCfg = AUDIENCE_CONFIG[notice.audience];
          const priorityCfg = PRIORITY_BADGE[notice.priority];
          const active = isActive(notice);

          return (
            <div
              key={notice._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* Audience Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${audienceCfg.color}`}
              >
                {audienceCfg.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{notice.title}</h3>
                    <Badge variant={priorityCfg.variant} size="sm">
                      {priorityCfg.label} Priority
                    </Badge>
                    {active ? (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                  {notice.content}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                  <span className={`flex items-center gap-1 font-semibold border rounded-full px-2 py-0.5 ${audienceCfg.color}`}>
                    {audienceCfg.icon}
                    {audienceCfg.label}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    {notice.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(notice.startDate).toLocaleDateString()}
                    {notice.endDate && (
                      <> — {new Date(notice.endDate).toLocaleDateString()}</>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Posted {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {notices.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
            No notices found. Post a notice to inform your school community.
          </div>
        )}

        {loading && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Loading notices...
          </div>
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Notice" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Notice Title *"
            required
            placeholder="e.g. School Holiday on 15th August"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            label="Content / Description *"
            required
            rows={5}
            placeholder="Write the full notice content here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Audience *"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as NoticeAudience })}
              options={[
                { value: 'ALL', label: 'All School' },
                { value: 'TEACHERS', label: 'Teachers Only' },
                { value: 'PARENTS', label: 'Parents Only' },
                { value: 'STUDENTS', label: 'Students Only' },
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as NoticePriority })}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'NORMAL', label: 'Normal' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Effective From *"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="Expires On (optional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
