import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { apiClient } from '../lib/apiClient';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export const TimetablePage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Slot modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '09:00 AM',
    endTime: '09:45 AM',
    subjectId: '',
    teacherId: '',
    room: 'Room 101',
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Classes & Teachers
  useEffect(() => {
    (async () => {
      try {
        const [classRes, teacherRes] = await Promise.all([
          apiClient.get('/academics/classes'),
          apiClient.get('/teachers?limit=100'),
        ]);
        if (classRes.data.success && classRes.data.data.length > 0) {
          setClasses(classRes.data.data);
          setSelectedClass(classRes.data.data[0]._id);
          if (classRes.data.data[0].sections?.length > 0) {
            setSections(classRes.data.data[0].sections);
            setSelectedSection(classRes.data.data[0].sections[0]._id);
          }
        }
        if (teacherRes.data.success) setTeachers(teacherRes.data.data);
      } catch (err) {
        console.error('Failed to load timetable metadata', err);
      }
    })();
  }, []);

  // Update subjects & sections when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      (async () => {
        try {
          const [subRes, secRes] = await Promise.all([
            apiClient.get(`/academics/subjects?classId=${selectedClass}`),
            apiClient.get(`/academics/sections?classId=${selectedClass}`),
          ]);
          if (subRes.data.success) {
            setSubjects(subRes.data.data);
            if (subRes.data.data.length > 0) {
              setSlotForm((prev) => ({ ...prev, subjectId: subRes.data.data[0]._id }));
            }
          }
          if (secRes.data.success) setSections(secRes.data.data);
        } catch (err) {
          console.error('Failed to load class subjects', err);
        }
      })();
    }
  }, [selectedClass]);

  // Fetch Slots
  const fetchSlots = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params: any = { classId: selectedClass };
      if (selectedSection) params.sectionId = selectedSection;
      const res = await apiClient.get('/timetable', { params });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load timetable slots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedClass, selectedSection]);

  const handleOpenAddSlot = (day: string, period: number) => {
    setSlotForm({
      dayOfWeek: day,
      periodNumber: period,
      startTime: `${8 + period}:00 AM`,
      endTime: `${8 + period}:45 AM`,
      subjectId: subjects[0]?._id || '',
      teacherId: teachers[0]?._id || '',
      room: 'Room 101',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload = {
        ...slotForm,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
      };
      const res = await apiClient.post('/timetable/slots', payload);
      if (res.data.success) {
        setToastMessage(`Period slot saved successfully!`);
        setIsModalOpen(false);
        fetchSlots();
      }
    } catch (err: any) {
      setModalError(
        err.response?.data?.message || 'Failed to save timetable slot (possible conflict)'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await apiClient.delete(`/timetable/slots/${id}`);
      fetchSlots();
    } catch (err) {
      console.error('Failed to delete slot', err);
    }
  };

  // Find slot for day & period
  const getSlot = (day: string, period: number) => {
    return slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Class Timetable Planner</h1>
            <Badge variant="success">Conflict Shield Active</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Weekly schedule grid with automated teacher and classroom double-booking prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSlots}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
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

      {/* Class & Section Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-subtle">
        <Select
          label="Class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="h-9 text-xs w-44"
          options={classes.map((c) => ({ value: c._id, label: c.name }))}
        />
        <Select
          label="Section"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="h-9 text-xs w-36"
          options={[
            { value: '', label: 'All Sections' },
            ...sections.map((s) => ({ value: s._id, label: `Section ${s.name}` })),
          ]}
        />
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Day</th>
                {PERIODS.map((p) => (
                  <th key={p} className="py-3 px-3 text-center border-l border-slate-200">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/50 uppercase text-[11px]">
                    {day.substring(0, 3)}
                  </td>
                  {PERIODS.map((period) => {
                    const slot = getSlot(day, period);
                    return (
                      <td
                        key={period}
                        className="py-2.5 px-2 text-center border-l border-slate-100 min-w-[110px]"
                      >
                        {slot ? (
                          <div className="bg-brand-50/80 border border-brand-200 rounded-xl p-2 relative group text-left">
                            <div className="font-bold text-brand-900 text-xs truncate">
                              {slot.subjectId?.name}
                            </div>
                            <div className="text-[10px] text-brand-700 truncate">
                              {slot.teacherId
                                ? `${slot.teacherId.firstName} ${slot.teacherId.lastName}`
                                : 'No Teacher'}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{slot.room}</div>
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAddSlot(day, period)}
                            className="w-full py-3 rounded-lg border border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/20 text-slate-400 hover:text-brand-600 transition-all flex items-center justify-center gap-1 text-[11px]"
                          >
                            <Plus className="w-3 h-3" /> Slot
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Timetable Slot" size="sm">
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-800">
              {slotForm.dayOfWeek} — Period {slotForm.periodNumber}
            </span>
          </div>

          <Select
            label="Subject *"
            value={slotForm.subjectId}
            onChange={(e) => setSlotForm({ ...slotForm, subjectId: e.target.value })}
            options={subjects.map((s) => ({ value: s._id, label: s.name }))}
          />

          <Select
            label="Teacher Assigned"
            value={slotForm.teacherId}
            onChange={(e) => setSlotForm({ ...slotForm, teacherId: e.target.value })}
            options={[
              { value: '', label: 'None (Self Study)' },
              ...teachers.map((t) => ({
                value: t._id,
                label: `${t.firstName} ${t.lastName} (${t.specialization || 'Faculty'})`,
              })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              value={slotForm.startTime}
              onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              value={slotForm.endTime}
              onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
            />
          </div>

          <Input
            label="Classroom / Hall"
            value={slotForm.room}
            onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Assign Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
