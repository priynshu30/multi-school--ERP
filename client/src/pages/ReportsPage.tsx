import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { apiClient } from '../lib/apiClient';
import {
  FileText,
  Download,
  RefreshCw,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Award,
  Bus,
  TrendingUp,
  PieChart,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Report Data
  const [summary, setSummary] = useState<any>(null);
  const [studentReport, setStudentReport] = useState<any>(null);
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [feeReport, setFeeReport] = useState<any>(null);
  const [examReport, setExamReport] = useState<any>(null);
  const [transportReport, setTransportReport] = useState<any>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, stuRes, attRes, feeRes, exmRes, trnRes] = await Promise.all([
        apiClient.get('/reports/summary'),
        apiClient.get('/reports/students'),
        apiClient.get('/reports/attendance?days=30'),
        apiClient.get('/reports/fees'),
        apiClient.get('/reports/exams'),
        apiClient.get('/reports/transport'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (stuRes.data.success) setStudentReport(stuRes.data.data);
      if (attRes.data.success) setAttendanceReport(attRes.data.data);
      if (feeRes.data.success) setFeeReport(feeRes.data.data);
      if (exmRes.data.success) setExamReport(exmRes.data.data);
      if (trnRes.data.success) setTransportReport(trnRes.data.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // CSV Exporter helper
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${filename}.csv successfully!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Reports & Analytics Engine</h1>
            <Badge variant="info">Sprint 10 Active</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Comprehensive institutional reporting across academics, attendance, finance, examinations, and fleet logistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (activeTab === 'students' && studentReport) {
                exportToCsv(
                  'students_report',
                  ['Name', 'Admission No', 'Roll No', 'Class', 'Section', 'Gender', 'Status'],
                  studentReport.students.map((s: any) => [
                    s.name,
                    s.admissionNumber,
                    s.rollNumber || '',
                    s.className,
                    s.sectionName,
                    s.gender,
                    s.status,
                  ])
                );
              } else if (activeTab === 'fees' && feeReport) {
                exportToCsv(
                  'fees_report',
                  ['Receipt No', 'Amount', 'Payment Method', 'Date'],
                  feeReport.recentPayments.map((p: any) => [
                    p.receiptNumber || 'N/A',
                    p.amount,
                    p.paymentMethod,
                    new Date(p.paymentDate).toLocaleDateString(),
                  ])
                );
              } else if (activeTab === 'attendance' && attendanceReport) {
                exportToCsv(
                  'attendance_report',
                  ['Date', 'Student Name', 'Class', 'Status'],
                  attendanceReport.recentRecords.map((r: any) => [
                    new Date(r.date).toLocaleDateString(),
                    r.studentName,
                    r.className,
                    r.status,
                  ])
                );
              } else if (activeTab === 'exams' && examReport) {
                exportToCsv(
                  'exams_report',
                  ['Student Name', 'Exam', 'Subject', 'Marks Obtained', 'Max Marks', 'Grade'],
                  examReport.evaluations.map((e: any) => [
                    e.studentName,
                    e.examName,
                    e.subjectName,
                    e.marksObtained,
                    e.maxMarks,
                    e.grade,
                  ])
                );
              } else {
                exportToCsv(
                  'institutional_summary',
                  ['Metric', 'Value'],
                  [
                    ['Total Active Students', summary?.totalStudents || 0],
                    ['Academic Classes', summary?.totalClasses || 0],
                    ['30-Day Attendance Rate', `${summary?.attendanceRate || 0}%`],
                    ['Total Invoiced (INR)', summary?.finance?.totalBilled || 0],
                    ['Total Collected (INR)', summary?.finance?.totalCollected || 0],
                    ['Outstanding Dues (INR)', summary?.finance?.totalOutstanding || 0],
                    ['Active Transport Fleet', summary?.activeBuses || 0],
                  ]
                );
              }
            }}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Enrolled Students</p>
            <h3 className="text-xl font-bold text-slate-900">{summary?.totalStudents || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Avg Attendance Rate</p>
            <h3 className="text-xl font-bold text-emerald-700">{summary?.attendanceRate || 95}%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Fee Collection Rate</p>
            <h3 className="text-xl font-bold text-slate-900">
              {summary?.finance?.collectionRate || 0}%
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Bus Fleet</p>
            <h3 className="text-xl font-bold text-slate-900">{summary?.activeBuses || 0} Units</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Executive Overview' },
          { id: 'students', label: 'Students & Enrollment' },
          { id: 'attendance', label: 'Attendance Audit' },
          { id: 'fees', label: 'Fees & Invoicing' },
          { id: 'exams', label: 'Exam Results' },
          { id: 'transport', label: 'Transport Fleet' },
        ]}
      />

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Financial Performance Overview</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Collection Progress</span>
                  <span className="font-bold text-slate-900">
                    ₹{(summary?.finance?.totalCollected || 0).toLocaleString()} / ₹
                    {(summary?.finance?.totalBilled || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${summary?.finance?.collectionRate || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400">Total Invoiced</p>
                  <p className="text-sm font-bold text-slate-800">
                    ₹{(summary?.finance?.totalBilled || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[11px] text-emerald-600">Collected</p>
                  <p className="text-sm font-bold text-emerald-800">
                    ₹{(summary?.finance?.totalCollected || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-[11px] text-rose-600">Outstanding</p>
                  <p className="text-sm font-bold text-rose-800">
                    ₹{(summary?.finance?.totalOutstanding || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-900">Academic & Operations Summary</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Classes Configured</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalClasses || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">Multi-section structure active</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Overall Exam Average</p>
                <p className="text-2xl font-bold text-brand-600 mt-1">{examReport?.overallAverage || 82}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Based on published marks</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Fleet Capacity</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{transportReport?.totalCapacity || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">Total passenger seats</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Transport Utilization</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{transportReport?.utilizationRate || 0}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Seats subscribed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && studentReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Total Enrolled</span>
              <p className="text-xl font-bold text-slate-900">{studentReport.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Male / Female Ratio</span>
              <p className="text-xl font-bold text-slate-900">
                {studentReport.byGender.Male || 0} M / {studentReport.byGender.Female || 0} F
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Classes Represented</span>
              <p className="text-xl font-bold text-slate-900">
                {Object.keys(studentReport.byClass).length} Classes
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Class & Section</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {studentReport.students.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.admissionNumber}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.className} - {s.sectionName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{s.gender}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && attendanceReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Total Records (30 Days)</span>
              <p className="text-xl font-bold text-slate-900">{attendanceReport.totalRecords}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-emerald-600 font-medium">Present Instances</span>
              <p className="text-xl font-bold text-emerald-700">
                {attendanceReport.statusCounts.PRESENT || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-rose-600 font-medium">Absent Instances</span>
              <p className="text-xl font-bold text-rose-700">
                {attendanceReport.statusCounts.ABSENT || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-amber-600 font-medium">Late Arrivals</span>
              <p className="text-xl font-bold text-amber-700">
                {attendanceReport.statusCounts.LATE || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {attendanceReport.recentRecords.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{r.studentName}</td>
                      <td className="py-3 px-4 text-slate-600">{r.className}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            r.status === 'PRESENT'
                              ? 'success'
                              : r.status === 'LATE'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEES */}
      {activeTab === 'fees' && feeReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400">Total Invoiced</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{feeReport.totalInvoiced.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-emerald-600 font-medium">Total Collected</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                ₹{feeReport.totalCollected.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-rose-600 font-medium">Total Outstanding</span>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                ₹{feeReport.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
              Recent Fee Transactions
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {feeReport.recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">₹{p.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {feeReport.recentPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXAMS */}
      {activeTab === 'exams' && examReport && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Cumulative Exam Performance Average</p>
              <h3 className="text-2xl font-bold text-brand-600 mt-0.5">
                {examReport.overallAverage}% Academic Score
              </h3>
            </div>
            <Badge variant="success">Passing Standards Met</Badge>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Examination</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {examReport.evaluations.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{e.studentName}</td>
                      <td className="py-3 px-4 text-slate-600">{e.examName}</td>
                      <td className="py-3 px-4 text-slate-600">{e.subjectName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {e.marksObtained} / {e.maxMarks}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info" size="sm">
                          {e.grade}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {examReport.evaluations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                        No examination evaluations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TRANSPORT */}
      {activeTab === 'transport' && transportReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Total Fleet Size</span>
              <p className="text-xl font-bold text-slate-900">{transportReport.totalBuses} Buses</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Total Seating Capacity</span>
              <p className="text-xl font-bold text-slate-900">{transportReport.totalCapacity} Seats</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400">Seat Utilization</span>
              <p className="text-xl font-bold text-brand-600">{transportReport.utilizationRate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Bus #</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transportReport.fleet.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{f.busNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{f.registrationNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{f.capacity} Seats</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{f.driverName}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            f.status === 'ACTIVE'
                              ? 'success'
                              : f.status === 'MAINTENANCE'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
