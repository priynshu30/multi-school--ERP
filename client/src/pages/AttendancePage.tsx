import React, { useState, useEffect } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { apiClient } from '../lib/apiClient';
import {
  CalendarCheck,
  UserCheck,
  BarChart3,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  AlertCircle,
  Save,
  Check,
  RefreshCw,
  Send,
  Sliders,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Common metadata
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // 1. Student Roll Call
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentRoster, setStudentRoster] = useState<any[]>([]);

  // 2. Staff Attendance
  const [staffDate, setStaffDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffRoster, setStaffRoster] = useState<any[]>([]);

  // 3. Summary Reports
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [summaryData, setSummaryData] = useState<any | null>(null);

  // 4. Biometric Gateway
  const [biometricLogs, setBiometricLogs] = useState<any[]>([]);
  const [simIdentifier, setSimIdentifier] = useState('');
  const [simEventType, setSimEventType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [simResult, setSimResult] = useState<any | null>(null);

  // Load Classes
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/academics/classes');
        if (res.data.success && res.data.data.length > 0) {
          setClasses(res.data.data);
          setSelectedClass(res.data.data[0]._id);
          if (res.data.data[0].sections?.length > 0) {
            setSections(res.data.data[0].sections);
            setSelectedSection(res.data.data[0].sections[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    })();
  }, []);

  // Update sections when selected class changes
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    const cls = classes.find((c) => c._id === classId);
    if (cls && cls.sections && cls.sections.length > 0) {
      setSections(cls.sections);
      setSelectedSection(cls.sections[0]._id);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  };

  // Fetch Student Sheet
  const fetchStudentSheet = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    setSuccessMessage(null);
    try {
      const params: any = { classId: selectedClass, date: selectedDate };
      if (selectedSection) params.sectionId = selectedSection;

      const res = await apiClient.get('/attendance/sheet', { params });
      if (res.data.success) {
        setStudentRoster(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student attendance sheet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' && selectedClass) {
      fetchStudentSheet();
    }
  }, [activeTab, selectedClass, selectedSection, selectedDate]);

  // Fetch Staff Sheet
  const fetchStaffSheet = async () => {
    setLoading(true);
    setSuccessMessage(null);
    try {
      const res = await apiClient.get(`/attendance/staff-sheet?date=${staffDate}`);
      if (res.data.success) {
        setStaffRoster(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load staff attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staff') {
      fetchStaffSheet();
    }
  }, [activeTab, staffDate]);

  // Fetch Monthly Summary
  const fetchSummary = async () => {
    try {
      const res = await apiClient.get(`/attendance/summary?yearMonth=${reportMonth}`);
      if (res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load summary', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchSummary();
    }
  }, [activeTab, reportMonth]);

  // Fetch Biometric Logs
  const fetchBiometricLogs = async () => {
    try {
      const res = await apiClient.get('/attendance/biometric/logs');
      if (res.data.success) {
        setBiometricLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load biometric logs', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'biometric') {
      fetchBiometricLogs();
    }
  }, [activeTab]);

  // Quick mark actions
  const handleMarkAllStudents = (status: string) => {
    setStudentRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status,
      }))
    );
  };

  const handleStudentStatusChange = (studentId: string, status: string) => {
    setStudentRoster((prev) =>
      prev.map((item) => (item.student._id === studentId ? { ...item, status } : item))
    );
  };

  const handleStudentRemarkChange = (studentId: string, remarks: string) => {
    setStudentRoster((prev) =>
      prev.map((item) => (item.student._id === studentId ? { ...item, remarks } : item))
    );
  };

  // Save Student Attendance
  const handleSaveStudentAttendance = async () => {
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const records = studentRoster.map((item) => ({
        studentId: item.student._id,
        status: item.status,
        remarks: item.remarks || '',
      }));

      const res = await apiClient.post('/attendance/bulk', {
        date: selectedDate,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
        records,
      });

      if (res.data.success) {
        setSuccessMessage(`Attendance saved for ${records.length} students on ${selectedDate}!`);
        fetchStudentSheet();
      }
    } catch (err: any) {
      console.error('Failed to save student attendance', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Save Staff Attendance
  const handleSaveStaffAttendance = async () => {
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const records = staffRoster.map((item) => ({
        staffId: item.staff._id,
        status: item.status,
        remarks: item.remarks || '',
      }));

      const res = await apiClient.post('/attendance/staff-bulk', {
        date: staffDate,
        records,
      });

      if (res.data.success) {
        setSuccessMessage(`Staff attendance saved for ${records.length} members on ${staffDate}!`);
        fetchStaffSheet();
      }
    } catch (err) {
      console.error('Failed to save staff attendance', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Biometric Test Simulation
  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simIdentifier) return;
    setSimResult(null);
    try {
      const res = await apiClient.post('/attendance/biometric/webhook', {
        deviceId: 'DEV-GATEWAY-01',
        identifier: simIdentifier,
        eventType: simEventType,
        rawEventId: `SIM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
      });
      setSimResult(res.data);
      setSimIdentifier('');
      fetchBiometricLogs();
    } catch (err: any) {
      setSimResult({ success: false, message: err.response?.data?.message || 'Punch error' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Attendance & Biometrics</h1>
            <Badge variant="success">Real-Time Sync</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Daily roll-call marking for students & staff, monthly analytics, and hardware biometric ingestion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === 'students') fetchStudentSheet();
              if (activeTab === 'staff') fetchStaffSheet();
              if (activeTab === 'reports') fetchSummary();
              if (activeTab === 'biometric') fetchBiometricLogs();
            }}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {activeTab === 'students' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveStudentAttendance}
              isLoading={submitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Roll Call
            </Button>
          )}
          {activeTab === 'staff' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveStaffAttendance}
              isLoading={submitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Staff Sheet
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 shadow-subtle">
        <Tabs
          tabs={[
            { id: 'students', label: 'Student Roll Call', icon: <CalendarCheck className="w-4 h-4" /> },
            { id: 'staff', label: 'Faculty & Staff', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'reports', label: 'Analytics & Reports', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'biometric', label: 'Biometric Gateway', icon: <Cpu className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: Student Roll Call */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs w-36"
              />
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="h-9 text-xs w-36"
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
              />
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="h-9 text-xs w-32"
                options={[
                  { value: '', label: 'All Sections' },
                  ...sections.map((s) => ({ value: s._id, label: `Section ${s.name}` })),
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Quick Set:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                onClick={() => handleMarkAllStudents('PRESENT')}
              >
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                onClick={() => handleMarkAllStudents('ABSENT')}
              >
                All Absent
              </Button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Adm #</th>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-6">Attendance Status</th>
                    <th className="py-3 px-5">Remarks</th>
                    <th className="py-3 px-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {studentRoster.map((item) => {
                    const s = item.student;
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={`${s.firstName} ${s.lastName}`} src={s.photo} size="sm" />
                            <span className="font-semibold text-slate-900">
                              {s.firstName} {s.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{s.admissionNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">{s.rollNumber || '-'}</td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { key: 'PRESENT', label: 'P', color: 'bg-emerald-600 text-white border-emerald-600' },
                              { key: 'ABSENT', label: 'A', color: 'bg-rose-600 text-white border-rose-600' },
                              { key: 'LATE', label: 'L', color: 'bg-amber-600 text-white border-amber-600' },
                              { key: 'HALF_DAY', label: 'HD', color: 'bg-indigo-600 text-white border-indigo-600' },
                              { key: 'LEAVE', label: 'LV', color: 'bg-slate-600 text-white border-slate-600' },
                            ].map((st) => {
                              const isSelected = item.status === st.key;
                              return (
                                <button
                                  key={st.key}
                                  type="button"
                                  onClick={() => handleStudentStatusChange(s._id, st.key)}
                                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? `${st.color} shadow-xs`
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={item.remarks}
                            onChange={(e) => handleStudentRemarkChange(s._id, e.target.value)}
                            className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={item.source === 'BIOMETRIC' ? 'warning' : 'info'} size="sm">
                            {item.source}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {studentRoster.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No students found in this class/section.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Staff Attendance */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-subtle">
            <Input
              label="Attendance Date"
              type="date"
              value={staffDate}
              onChange={(e) => setStaffDate(e.target.value)}
              className="h-9 text-xs w-44"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Staff Member</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {staffRoster.map((item) => {
                    const st = item.staff;
                    return (
                      <tr key={st._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={`${st.firstName} ${st.lastName}`} src={st.photo} size="sm" />
                            <div>
                              <div className="font-semibold text-slate-900">
                                {st.firstName} {st.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400">{st.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{st.employeeId}</td>
                        <td className="py-3.5 px-4 text-slate-700">{st.department}</td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5">
                            {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  setStaffRoster((prev) =>
                                    prev.map((r) =>
                                      r.staff._id === st._id ? { ...r, status } : r
                                    )
                                  );
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-bold border transition-all ${
                                  item.status === status
                                    ? 'bg-brand-600 text-white border-brand-600'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {status.substring(0, 1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Analytics & Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-3">
              <Input
                label="Report Month"
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="h-9 text-xs w-44"
              />
            </div>
          </div>

          {summaryData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <span className="text-xs text-slate-400 font-medium block mb-1">Monthly Average</span>
                <span className="text-3xl font-bold text-slate-900">{summaryData.attendancePercentage}%</span>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${summaryData.attendancePercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <span className="text-xs text-slate-400 font-medium block mb-1">Total Roll-Calls</span>
                <span className="text-3xl font-bold text-slate-900">{summaryData.totalDaysRecorded}</span>
                <p className="text-[11px] text-slate-400 mt-2">Recorded data points this month</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <span className="text-xs text-slate-400 font-medium block mb-1">Present Count</span>
                <span className="text-3xl font-bold text-emerald-600">
                  {summaryData.breakdown?.PRESENT || 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Full attendance markers</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <span className="text-xs text-slate-400 font-medium block mb-1">Absences Count</span>
                <span className="text-3xl font-bold text-rose-600">
                  {summaryData.breakdown?.ABSENT || 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Unexcused absence records</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Biometric Gateway */}
      {activeTab === 'biometric' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Console */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-600" />
                Hardware Punch Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate a real-time HTTP punch event from an attendance device.
              </p>
            </div>

            {simResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  simResult.success || simResult.status !== 'UNMAPPED_IDENTIFIER'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold">{simResult.message || simResult.status}</div>
                {simResult.data?.entity && <div>Matched: {simResult.data.entity}</div>}
              </div>
            )}

            <form onSubmit={handleSimulatePunch} className="space-y-3">
              <Input
                label="Badge / Employee ID / Adm No *"
                required
                placeholder="e.g. EMP-101 or GVA-2026-001"
                value={simIdentifier}
                onChange={(e) => setSimIdentifier(e.target.value)}
              />
              <Select
                label="Punch Type"
                value={simEventType}
                onChange={(e) => setSimEventType(e.target.value as any)}
                options={[
                  { value: 'CHECK_IN', label: 'Check In' },
                  { value: 'CHECK_OUT', label: 'Check Out' },
                ]}
              />

              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="w-full mt-2"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Trigger Device Punch
              </Button>
            </form>
          </div>

          {/* Punch Event Log Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                Device Ingestion Event Stream
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Gateway: DEV-GATEWAY-01</span>
            </div>

            <div className="flex-1 max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
              {biometricLogs.map((log) => (
                <div key={log._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        log.processed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {log.eventType === 'CHECK_IN' ? 'IN' : 'OUT'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 font-mono">{log.identifier}</div>
                      <div className="text-[10px] text-slate-400">
                        {log.mappedTargetType ? `Matched ${log.mappedTargetType}` : log.errorMessage || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-600 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}

              {biometricLogs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No biometric punch events received yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
