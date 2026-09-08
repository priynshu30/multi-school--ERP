import React, { useState, useEffect } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { apiClient } from '../lib/apiClient';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Plus,
  Edit2,
  Eye,
  Printer,
  Award,
  Save,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Metadata
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // 1. Create Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    term: 'Term 1',
    academicYear: '2026-2027',
    startDate: '',
    endDate: '',
  });

  // 2. Schedule Slot Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedExamForSchedule, setSelectedExamForSchedule] = useState<string>('');
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    examId: '',
    classId: '',
    subjectId: '',
    examDate: '',
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    maxMarks: 100,
    passMarks: 35,
    room: 'Hall A',
  });

  // 3. Marks Entry
  const [entryExamId, setEntryExamId] = useState('');
  const [entryClassId, setEntryClassId] = useState('');
  const [entrySectionId, setEntrySectionId] = useState('');
  const [entrySubjectId, setEntrySubjectId] = useState('');
  const [marksheet, setMarksheet] = useState<any[]>([]);

  // 4. Report Card View
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportExamId, setReportExamId] = useState('');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [reportCardData, setReportCardData] = useState<any | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState('');

  // Load Common Metadata
  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const [examRes, classRes] = await Promise.all([
        apiClient.get('/exams'),
        apiClient.get('/academics/classes'),
      ]);
      if (examRes.data.success) {
        setExams(examRes.data.data);
        if (examRes.data.data.length > 0) {
          setSelectedExamForSchedule(examRes.data.data[0]._id);
          setEntryExamId(examRes.data.data[0]._id);
          setReportExamId(examRes.data.data[0]._id);
        }
      }
      if (classRes.data.success) {
        setClasses(classRes.data.data);
        if (classRes.data.data.length > 0) {
          setEntryClassId(classRes.data.data[0]._id);
          setSections(classRes.data.data[0].sections || []);
        }
      }
    } catch (err) {
      console.error('Failed to load exams metadata', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Update subjects & sections when entry class changes
  useEffect(() => {
    if (entryClassId) {
      (async () => {
        try {
          const [subRes, secRes, studRes] = await Promise.all([
            apiClient.get(`/academics/subjects?classId=${entryClassId}`),
            apiClient.get(`/academics/sections?classId=${entryClassId}`),
            apiClient.get(`/students?classId=${entryClassId}&limit=100`),
          ]);
          if (subRes.data.success) {
            setSubjects(subRes.data.data);
            if (subRes.data.data.length > 0) setEntrySubjectId(subRes.data.data[0]._id);
          }
          if (secRes.data.success) setSections(secRes.data.data);
          if (studRes.data.success) {
            setStudentsList(studRes.data.data);
            if (studRes.data.data.length > 0) setReportStudentId(studRes.data.data[0]._id);
          }
        } catch (err) {
          console.error('Failed to load class subjects/sections', err);
        }
      })();
    }
  }, [entryClassId]);

  // Fetch Schedules when selectedExamForSchedule changes
  const fetchSchedules = async () => {
    if (!selectedExamForSchedule) return;
    try {
      const res = await apiClient.get(`/exams/${selectedExamForSchedule}/schedules`);
      if (res.data.success) setSchedulesList(res.data.data);
    } catch (err) {
      console.error('Failed to load schedules', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules' && selectedExamForSchedule) {
      fetchSchedules();
    }
  }, [activeTab, selectedExamForSchedule]);

  // Fetch Marksheet
  const fetchMarksheet = async () => {
    if (!entryExamId || !entryClassId || !entrySubjectId) return;
    setLoading(true);
    try {
      const params: any = {
        examId: entryExamId,
        classId: entryClassId,
        subjectId: entrySubjectId,
      };
      if (entrySectionId) params.sectionId = entrySectionId;

      const res = await apiClient.get('/exams/marks/sheet', { params });
      if (res.data.success) {
        setMarksheet(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load marksheet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'marks') {
      fetchMarksheet();
    }
  }, [activeTab, entryExamId, entryClassId, entrySectionId, entrySubjectId]);

  // Create Exam Session
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/exams', examForm);
      if (res.data.success) {
        setToastMessage(`Exam "${examForm.name}" created successfully!`);
        setIsExamModalOpen(false);
        fetchMetadata();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Exam Schedule Slot
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/exams/schedules', {
        ...scheduleForm,
        examId: selectedExamForSchedule,
      });
      if (res.data.success) {
        setToastMessage('Schedule slot created!');
        setIsScheduleModalOpen(false);
        fetchSchedules();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark change in marksheet
  const handleMarkChange = (studentId: string, val: string) => {
    setMarksheet((prev) =>
      prev.map((item) =>
        item.student._id === studentId ? { ...item, marksObtained: val } : item
      )
    );
  };

  // Save Bulk Marks
  const handleSaveMarks = async () => {
    setSubmitting(true);
    try {
      const payload = {
        examId: entryExamId,
        classId: entryClassId,
        sectionId: entrySectionId || undefined,
        subjectId: entrySubjectId,
        maxMarks: 100,
        marks: marksheet
          .filter((m) => m.marksObtained !== '')
          .map((m) => ({
            studentId: m.student._id,
            marksObtained: Number(m.marksObtained),
            remarks: m.remarks || '',
          })),
      };

      const res = await apiClient.post('/exams/marks/bulk', payload);
      if (res.data.success) {
        setToastMessage(`Saved marks for ${payload.marks.length} students!`);
        fetchMarksheet();
      }
    } catch (err) {
      console.error('Failed to save marks', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch Student Report Card
  const handleGenerateReportCard = async () => {
    if (!reportExamId || !reportStudentId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/exams/${reportExamId}/report-card/${reportStudentId}`);
      if (res.data.success) {
        setReportCardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load report card', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && reportExamId && reportStudentId) {
      handleGenerateReportCard();
    }
  }, [activeTab, reportExamId, reportStudentId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Exams & Assessment Portal</h1>
            <Badge variant="info">{exams.length} Sessions</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Exam scheduling, marksheet entry, automated letter grading, and report card generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetadata}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setExamForm({
                name: '',
                term: 'Term 1',
                academicYear: '2026-2027',
                startDate: '',
                endDate: '',
              });
              setModalError('');
              setIsExamModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Exam
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 shadow-subtle">
        <Tabs
          tabs={[
            { id: 'exams', label: 'Exam Sessions', icon: <Calendar className="w-4 h-4" /> },
            { id: 'schedules', label: 'Exam Schedules', icon: <Clock className="w-4 h-4" /> },
            { id: 'marks', label: 'Marks Entry Sheet', icon: <Edit2 className="w-4 h-4" /> },
            { id: 'reports', label: 'Student Report Cards', icon: <Award className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* TAB 1: Exam Sessions */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">{ex.name}</h3>
                  <Badge variant={ex.status === 'PUBLISHED' ? 'success' : 'info'}>{ex.status}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  <div>
                    Term: <span className="font-semibold text-slate-700">{ex.term}</span>
                  </div>
                  <div>
                    Session: <span className="font-semibold text-slate-700">{ex.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(ex.startDate).toLocaleDateString()} –{' '}
                      {new Date(ex.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSelectedExamForSchedule(ex._id);
                    setActiveTab('schedules');
                  }}
                >
                  View Schedule
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setEntryExamId(ex._id);
                    setActiveTab('marks');
                  }}
                >
                  Enter Marks
                </Button>
              </div>
            </div>
          ))}

          {exams.length === 0 && (
            <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
              No examination sessions configured. Click 'Create Exam' to schedule your first term assessment.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Exam Schedules */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3">
              <Select
                label="Exam Session"
                value={selectedExamForSchedule}
                onChange={(e) => setSelectedExamForSchedule(e.target.value)}
                className="h-9 text-xs w-48"
                options={exams.map((ex) => ({ value: ex._id, label: ex.name }))}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setScheduleForm({
                  examId: selectedExamForSchedule,
                  classId: classes[0]?._id || '',
                  subjectId: subjects[0]?._id || '',
                  examDate: '',
                  startTime: '09:30 AM',
                  endTime: '12:30 PM',
                  maxMarks: 100,
                  passMarks: 35,
                  room: 'Hall A',
                });
                setIsScheduleModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Schedule Slot
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Subject</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Max / Pass</th>
                    <th className="py-3 px-4">Hall / Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {schedulesList.map((slot) => (
                    <tr key={slot._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {slot.subjectId?.name} ({slot.subjectId?.code || 'GEN'})
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{slot.classId?.name}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {new Date(slot.examDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {slot.startTime} – {slot.endTime}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {slot.maxMarks} / {slot.passMarks}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{slot.room || 'TBD'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {schedulesList.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No slots scheduled for this exam session yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Marks Entry */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                label="Exam"
                value={entryExamId}
                onChange={(e) => setEntryExamId(e.target.value)}
                className="h-9 text-xs w-44"
                options={exams.map((ex) => ({ value: ex._id, label: ex.name }))}
              />
              <Select
                label="Class"
                value={entryClassId}
                onChange={(e) => setEntryClassId(e.target.value)}
                className="h-9 text-xs w-36"
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
              />
              <Select
                label="Section"
                value={entrySectionId}
                onChange={(e) => setEntrySectionId(e.target.value)}
                className="h-9 text-xs w-32"
                options={[
                  { value: '', label: 'All Sections' },
                  ...sections.map((s) => ({ value: s._id, label: `Section ${s.name}` })),
                ]}
              />
              <Select
                label="Subject"
                value={entrySubjectId}
                onChange={(e) => setEntrySubjectId(e.target.value)}
                className="h-9 text-xs w-44"
                options={subjects.map((sub) => ({ value: sub._id, label: sub.name }))}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveMarks}
              isLoading={submitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Marks
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Adm #</th>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Marks (Out of 100)</th>
                    <th className="py-3 px-4">Calculated Grade</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {marksheet.map((row) => {
                    const st = row.student;
                    return (
                      <tr key={st._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{st.admissionNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">{st.rollNumber || '-'}</td>
                        <td className="py-3.5 px-4">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0 - 100"
                            value={row.marksObtained}
                            onChange={(e) => handleMarkChange(st._id, e.target.value)}
                            className="w-24 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 font-semibold"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          {row.grade ? (
                            <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded text-xs">
                              {row.grade}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Auto</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={row.isRecorded ? 'success' : 'warning'} size="sm">
                            {row.isRecorded ? 'Recorded' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {marksheet.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                Select an exam, class, and subject to begin entering marks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Student Report Cards */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-3">
              <Select
                label="Exam Session"
                value={reportExamId}
                onChange={(e) => setReportExamId(e.target.value)}
                className="h-9 text-xs w-48"
                options={exams.map((ex) => ({ value: ex._id, label: ex.name }))}
              />
              <Select
                label="Select Student"
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="h-9 text-xs w-56"
                options={studentsList.map((s) => ({
                  value: s._id,
                  label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
                }))}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Report Card
            </Button>
          </div>

          {/* Printable Report Card Sheet */}
          {reportCardData && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-subtle max-w-3xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Academic Performance Report Card
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {reportCardData.exam?.name} • Session {reportCardData.exam?.academicYear}
                </p>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Student Name</span>
                  <span className="font-bold text-slate-900">
                    {reportCardData.student?.firstName} {reportCardData.student?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Admission No</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {reportCardData.student?.admissionNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Class / Section</span>
                  <span className="font-semibold text-slate-800">
                    {reportCardData.student?.classId?.name}
                    {reportCardData.student?.sectionId && ` (${reportCardData.student.sectionId.name})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Result Status</span>
                  <Badge variant={reportCardData.summary?.resultStatus === 'PASSED' ? 'success' : 'danger'}>
                    {reportCardData.summary?.resultStatus}
                  </Badge>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 font-bold text-slate-700">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Max Marks</th>
                    <th className="py-2.5 px-4">Marks Obtained</th>
                    <th className="py-2.5 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportCardData.marks?.map((m: any) => (
                    <tr key={m._id}>
                      <td className="py-3 px-4 font-semibold text-slate-800">{m.subjectId?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{m.maxMarks}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.marksObtained}</td>
                      <td className="py-3 px-4 font-bold text-brand-700">{m.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Total Marks:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {reportCardData.summary?.totalMarksObtained} / {reportCardData.summary?.totalMaxMarks}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Aggregate Percentage:</span>{' '}
                  <span className="font-bold text-slate-900 text-sm">
                    {reportCardData.summary?.percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Final Grade:</span>{' '}
                  <span className="font-bold text-brand-700 text-base">
                    {reportCardData.summary?.overallGrade}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Schedule New Examination Session"
        size="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Exam Session Name *"
            required
            placeholder="e.g. Mid-Term Examination 2026"
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Term"
              value={examForm.term}
              onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
              options={[
                { value: 'Term 1', label: 'Term 1' },
                { value: 'Term 2', label: 'Term 2' },
                { value: 'Annual', label: 'Annual' },
                { value: 'Unit Test', label: 'Unit Test' },
              ]}
            />
            <Input
              label="Academic Year"
              value={examForm.academicYear}
              onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              required
              value={examForm.startDate}
              onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
            />
            <Input
              label="End Date *"
              type="date"
              required
              value={examForm.endDate}
              onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Create Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Schedule Slot Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Add Exam Schedule Slot"
        size="md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class *"
              value={scheduleForm.classId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select
              label="Subject *"
              value={scheduleForm.subjectId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })}
              options={subjects.map((sub) => ({ value: sub._id, label: sub.name }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Exam Date *"
              type="date"
              required
              value={scheduleForm.examDate}
              onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })}
            />
            <Input
              label="Start Time *"
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
            />
            <Input
              label="End Time *"
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Max Marks"
              type="number"
              value={scheduleForm.maxMarks}
              onChange={(e) => setScheduleForm({ ...scheduleForm, maxMarks: Number(e.target.value) })}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={scheduleForm.passMarks}
              onChange={(e) => setScheduleForm({ ...scheduleForm, passMarks: Number(e.target.value) })}
            />
            <Input
              label="Hall / Room"
              value={scheduleForm.room}
              onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Add Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
