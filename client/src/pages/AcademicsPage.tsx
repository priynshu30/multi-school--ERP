import React, { useState, useEffect } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { apiClient } from '../lib/apiClient';
import {
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  ArrowRightLeft,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const AcademicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Classes & Sections state
  const [classes, setClasses] = useState<any[]>([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classForm, setClassForm] = useState({ name: '', order: 1 });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [targetClassForSection, setTargetClassForSection] = useState<any | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: 40, classTeacherId: '' });

  // Subjects state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    classId: '',
    teacherId: '',
    isOptional: false,
  });

  // Academic Years state
  const [years, setYears] = useState<any[]>([]);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<any | null>(null);
  const [yearForm, setYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  // Student Promotion state
  const [promotionSourceClass, setPromotionSourceClass] = useState('');
  const [promotionSourceSection, setPromotionSourceSection] = useState('');
  const [promotionTargetClass, setPromotionTargetClass] = useState('');
  const [promotionTargetSection, setPromotionTargetSection] = useState('');
  const [promotionTargetYear, setPromotionTargetYear] = useState('2026-2027');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [promotionResult, setPromotionResult] = useState<string | null>(null);

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Initial loads
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, subRes, yearRes, teacherRes] = await Promise.all([
        apiClient.get('/academics/classes'),
        apiClient.get('/academics/subjects'),
        apiClient.get('/academics/years'),
        apiClient.get('/teachers?limit=100'),
      ]);
      if (classRes.data.success) setClasses(classRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (yearRes.data.success) setYears(yearRes.data.data);
      if (teacherRes.data.success) setTeachers(teacherRes.data.data);
    } catch (err) {
      console.error('Failed to load academic data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch candidates for student promotion
  const fetchPromotionCandidates = async () => {
    if (!promotionSourceClass) return;
    try {
      const params: any = { classId: promotionSourceClass, limit: 100 };
      if (promotionSourceSection) params.sectionId = promotionSourceSection;
      const res = await apiClient.get('/students', { params });
      if (res.data.success) {
        setCandidates(res.data.data);
        setSelectedCandidateIds(res.data.data.map((s: any) => s._id));
      }
    } catch (err) {
      console.error('Failed to load candidates', err);
    }
  };

  useEffect(() => {
    fetchPromotionCandidates();
  }, [promotionSourceClass, promotionSourceSection]);

  // ================= Class handlers =================
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (selectedClass) {
        await apiClient.patch(`/academics/classes/${selectedClass._id}`, classForm);
      } else {
        await apiClient.post('/academics/classes', classForm);
      }
      setIsClassModalOpen(false);
      setSelectedClass(null);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  // ================= Section handlers =================
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (selectedSection) {
        await apiClient.patch(`/academics/sections/${selectedSection._id}`, sectionForm);
      } else {
        await apiClient.post('/academics/sections', {
          ...sectionForm,
          classId: targetClassForSection?._id,
        });
      }
      setIsSectionModalOpen(false);
      setSelectedSection(null);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save section');
    } finally {
      setSubmitting(false);
    }
  };

  // ================= Subject handlers =================
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (selectedSubject) {
        await apiClient.patch(`/academics/subjects/${selectedSubject._id}`, subjectForm);
      } else {
        await apiClient.post('/academics/subjects', subjectForm);
      }
      setIsSubjectModalOpen(false);
      setSelectedSubject(null);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  // ================= Year handlers =================
  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (selectedYear) {
        await apiClient.patch(`/academics/years/${selectedYear._id}`, yearForm);
      } else {
        await apiClient.post('/academics/years', yearForm);
      }
      setIsYearModalOpen(false);
      setSelectedYear(null);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save academic year');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveYear = async (yearId: string) => {
    try {
      await apiClient.patch(`/academics/years/${yearId}/activate`);
      fetchData();
    } catch (err) {
      console.error('Failed to set active academic year', err);
    }
  };

  // ================= Promotion Execution =================
  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0 || !promotionTargetClass) return;
    setSubmitting(true);
    setPromotionResult(null);
    try {
      const res = await apiClient.post('/academics/promote-students', {
        studentIds: selectedCandidateIds,
        targetClassId: promotionTargetClass,
        targetSectionId: promotionTargetSection || undefined,
        targetAcademicYear: promotionTargetYear,
      });
      if (res.data.success) {
        setPromotionResult(
          `Successfully promoted ${res.data.data.promotedCount} student(s) to ${res.data.data.targetClassName} (${res.data.data.academicYear})!`
        );
        fetchPromotionCandidates();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to promote students');
    } finally {
      setSubmitting(false);
    }
  };

  // ================= Delete Execution =================
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      if (deleteTarget.type === 'class') {
        await apiClient.delete(`/academics/classes/${deleteTarget.id}`);
      } else if (deleteTarget.type === 'section') {
        await apiClient.delete(`/academics/sections/${deleteTarget.id}`);
      } else if (deleteTarget.type === 'subject') {
        await apiClient.delete(`/academics/subjects/${deleteTarget.id}`);
      } else if (deleteTarget.type === 'year') {
        await apiClient.delete(`/academics/years/${deleteTarget.id}`);
      }
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      console.error('Delete error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Academic Management</h1>
            <Badge variant="info">{classes.length} Classes</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Configure classes, sections, subject curriculum, and student promotion cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {activeTab === 'classes' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedClass(null);
                setClassForm({ name: '', order: classes.length + 1 });
                setFormError('');
                setIsClassModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Class
            </Button>
          )}
          {activeTab === 'subjects' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedSubject(null);
                setSubjectForm({ name: '', code: '', classId: '', teacherId: '', isOptional: false });
                setFormError('');
                setIsSubjectModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Subject
            </Button>
          )}
          {activeTab === 'years' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedYear(null);
                setYearForm({ name: '', startDate: '', endDate: '', isCurrent: false });
                setFormError('');
                setIsYearModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Academic Year
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 shadow-subtle">
        <Tabs
          tabs={[
            { id: 'classes', label: 'Classes & Sections', icon: <Layers className="w-4 h-4" /> },
            { id: 'subjects', label: 'Curriculum & Subjects', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'years', label: 'Academic Years', icon: <Calendar className="w-4 h-4" /> },
            { id: 'promotion', label: 'Student Promotion', icon: <ArrowRightLeft className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* TAB 1: Classes & Sections */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {cls.order || '•'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cls.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        {cls.studentCount || 0} active students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-slate-400 hover:text-brand-600"
                      onClick={() => {
                        setSelectedClass(cls);
                        setClassForm({ name: cls.name, order: cls.order });
                        setIsClassModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-slate-400 hover:text-rose-600"
                      onClick={() => {
                        setDeleteTarget({ type: 'class', id: cls._id, name: cls.name });
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Sections List */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase">
                    <span>Sections ({cls.sections?.length || 0})</span>
                    <button
                      className="text-brand-600 hover:text-brand-700 text-xs lowercase font-medium flex items-center gap-0.5"
                      onClick={() => {
                        setTargetClassForSection(cls);
                        setSelectedSection(null);
                        setSectionForm({ name: '', capacity: 40, classTeacherId: '' });
                        setIsSectionModalOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3" /> add section
                    </button>
                  </div>

                  {cls.sections && cls.sections.length > 0 ? (
                    <div className="space-y-1.5">
                      {cls.sections.map((sec: any) => (
                        <div
                          key={sec._id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 mr-2">Section {sec.name}</span>
                            <span className="text-[11px] text-slate-400">Cap: {sec.capacity || 40}</span>
                            {sec.classTeacherId && (
                              <div className="text-[10px] text-brand-700 font-medium mt-0.5">
                                Teacher: {sec.classTeacherId.firstName} {sec.classTeacherId.lastName}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-slate-400 hover:text-brand-600"
                              onClick={() => {
                                setTargetClassForSection(cls);
                                setSelectedSection(sec);
                                setSectionForm({
                                  name: sec.name,
                                  capacity: sec.capacity || 40,
                                  classTeacherId: sec.classTeacherId?._id || '',
                                });
                                setIsSectionModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-slate-400 hover:text-rose-600"
                              onClick={() => {
                                setDeleteTarget({ type: 'section', id: sec._id, name: `Section ${sec.name}` });
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl">
                      No sections configured.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Subjects */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Subject Name</th>
                  <th className="py-3 px-5">Code</th>
                  <th className="py-3 px-5">Applicable Class</th>
                  <th className="py-3 px-5">Assigned Teacher</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{sub.name}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">
                      {sub.code ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{sub.code}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">{sub.classId?.name || 'All Grades'}</td>
                    <td className="py-3.5 px-5 text-slate-700">
                      {sub.teacherId ? (
                        <span>
                          {sub.teacherId.firstName} {sub.teacherId.lastName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={sub.isOptional ? 'warning' : 'info'}>
                        {sub.isOptional ? 'Elective' : 'Core'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-slate-400 hover:text-brand-600"
                          onClick={() => {
                            setSelectedSubject(sub);
                            setSubjectForm({
                              name: sub.name,
                              code: sub.code || '',
                              classId: sub.classId?._id || '',
                              teacherId: sub.teacherId?._id || '',
                              isOptional: Boolean(sub.isOptional),
                            });
                            setIsSubjectModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-slate-400 hover:text-rose-600"
                          onClick={() => {
                            setDeleteTarget({ type: 'subject', id: sub._id, name: sub.name });
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Academic Years */}
      {activeTab === 'years' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {years.map((y) => (
            <div
              key={y._id}
              className={`bg-white rounded-2xl border p-5 shadow-subtle ${
                y.isCurrent ? 'border-brand-500 ring-2 ring-brand-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <h3 className="font-bold text-slate-900 text-base">{y.name}</h3>
                </div>
                {y.isCurrent && (
                  <Badge variant="success" size="sm">
                    Current Active
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-500 mb-4">
                <div>
                  Start Date: <span className="font-medium text-slate-700">{new Date(y.startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  End Date: <span className="font-medium text-slate-700">{new Date(y.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {!y.isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSetActiveYear(y._id)}
                  >
                    Set as Current
                  </Button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-slate-400 hover:text-brand-600"
                    onClick={() => {
                      setSelectedYear(y);
                      setYearForm({
                        name: y.name,
                        startDate: y.startDate ? y.startDate.split('T')[0] : '',
                        endDate: y.endDate ? y.endDate.split('T')[0] : '',
                        isCurrent: y.isCurrent,
                      });
                      setIsYearModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {!y.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-slate-400 hover:text-rose-600"
                      onClick={() => {
                        setDeleteTarget({ type: 'year', id: y._id, name: y.name });
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Student Promotion */}
      {activeTab === 'promotion' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Batch Student Promotion</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Advance students across grades for the new academic year session.
            </p>
          </div>

          {promotionResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{promotionResult}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
            {/* Source */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Select Current Class
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="From Class *"
                  value={promotionSourceClass}
                  onChange={(e) => setPromotionSourceClass(e.target.value)}
                  options={[
                    { value: '', label: 'Select Class' },
                    ...classes.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                />
                <Select
                  label="From Section"
                  value={promotionSourceSection}
                  onChange={(e) => setPromotionSourceSection(e.target.value)}
                  options={[
                    { value: '', label: 'All Sections' },
                    ...(classes
                      .find((c) => c._id === promotionSourceClass)
                      ?.sections?.map((s: any) => ({ value: s._id, label: s.name })) || []),
                  ]}
                />
              </div>
            </div>

            {/* Target */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Target Destination
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="To Class *"
                  value={promotionTargetClass}
                  onChange={(e) => setPromotionTargetClass(e.target.value)}
                  options={[
                    { value: '', label: 'Promote To...' },
                    ...classes.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                />
                <Select
                  label="To Section"
                  value={promotionTargetSection}
                  onChange={(e) => setPromotionTargetSection(e.target.value)}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...(classes
                      .find((c) => c._id === promotionTargetClass)
                      ?.sections?.map((s: any) => ({ value: s._id, label: s.name })) || []),
                  ]}
                />
                <Input
                  label="New Session *"
                  value={promotionTargetYear}
                  onChange={(e) => setPromotionTargetYear(e.target.value)}
                  placeholder="2026-2027"
                />
              </div>
            </div>
          </div>

          {/* Candidate List */}
          {candidates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {selectedCandidateIds.length} of {candidates.length} students selected
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-brand-600 hover:underline font-medium text-xs"
                    onClick={() => setSelectedCandidateIds(candidates.map((c) => c._id))}
                  >
                    Select All
                  </button>
                  <button
                    className="text-slate-500 hover:underline text-xs"
                    onClick={() => setSelectedCandidateIds([])}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {candidates.map((c) => {
                  const isChecked = selectedCandidateIds.includes(c._id);
                  return (
                    <div
                      key={c._id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedCandidateIds((prev) => prev.filter((id) => id !== c._id));
                        } else {
                          setSelectedCandidateIds((prev) => [...prev, c._id]);
                        }
                      }}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">Adm: #{c.admissionNumber}</span>
                        </div>
                      </div>
                      <Badge variant="info" size="sm">
                        {c.sectionId?.name ? `Sec ${c.sectionId.name}` : 'No Sec'}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecutePromotion}
                  disabled={selectedCandidateIds.length === 0 || !promotionTargetClass}
                  isLoading={submitting}
                  leftIcon={<ArrowRightLeft className="w-4 h-4" />}
                >
                  Promote {selectedCandidateIds.length} Students
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={selectedClass ? 'Edit Class' : 'Create Class'}
        size="sm"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <Input
            label="Class Name *"
            required
            placeholder="e.g. Class 7 or Grade 7"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
          />
          <Input
            label="Sort Order"
            type="number"
            value={classForm.order}
            onChange={(e) => setClassForm({ ...classForm, order: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={selectedSection ? 'Edit Section' : `Add Section to ${targetClassForSection?.name}`}
        size="sm"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <Input
            label="Section Name *"
            required
            placeholder="e.g. A, B, C"
            value={sectionForm.name}
            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
          />
          <Input
            label="Capacity"
            type="number"
            value={sectionForm.capacity}
            onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
          />
          <Select
            label="Class Teacher"
            value={sectionForm.classTeacherId}
            onChange={(e) => setSectionForm({ ...sectionForm, classTeacherId: e.target.value })}
            options={[
              { value: '', label: 'None Assigned' },
              ...teachers.map((t) => ({
                value: t._id,
                label: `${t.firstName} ${t.lastName} (${t.specialization || 'Teacher'})`,
              })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={selectedSubject ? 'Edit Subject' : 'Add Subject'}
        size="md"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Name *"
              required
              placeholder="e.g. Mathematics"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            />
            <Input
              label="Subject Code"
              placeholder="e.g. MTH-101"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              value={subjectForm.classId}
              onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Select
              label="Subject Teacher"
              value={subjectForm.teacherId}
              onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...teachers.map((t) => ({
                  value: t._id,
                  label: `${t.firstName} ${t.lastName}`,
                })),
              ]}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isOptional"
              checked={subjectForm.isOptional}
              onChange={(e) => setSubjectForm({ ...subjectForm, isOptional: e.target.checked })}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isOptional" className="text-xs text-slate-700 font-medium">
              Elective / Optional Subject
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Year Modal */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title={selectedYear ? 'Edit Academic Year' : 'New Academic Year'}
        size="sm"
      >
        <form onSubmit={handleSaveYear} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <Input
            label="Year Name *"
            required
            placeholder="e.g. 2026-2027"
            value={yearForm.name}
            onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="date"
              required
              value={yearForm.startDate}
              onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
            />
            <Input
              label="End Date *"
              type="date"
              required
              value={yearForm.endDate}
              onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={yearForm.isCurrent}
              onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isCurrent" className="text-xs text-slate-700 font-medium">
              Set as current active session
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsYearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}`}
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={submitting}
      />
    </div>
  );
};
