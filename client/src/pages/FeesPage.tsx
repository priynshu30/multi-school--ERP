import React, { useState, useEffect } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { apiClient } from '../lib/apiClient';
import {
  CreditCard,
  Receipt,
  Layers,
  FilePlus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Eye,
  RefreshCw,
  Printer,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  classId?: { name: string };
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  createdAt: string;
}

export const FeesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [loading, setLoading] = useState(false);

  // Telemetry KPIs
  const [summary, setSummary] = useState<any | null>(null);

  // Invoices Table State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Classes & Fee Structures metadata
  const [classes, setClasses] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);

  // Collect Payment Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    transactionReference: '',
    notes: '',
  });

  // Invoice Details & Receipt Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailedInvoice, setDetailedInvoice] = useState<any | null>(null);

  // New Structure Modal
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureForm, setStructureForm] = useState({
    name: '',
    academicYear: '2026-2027',
    classId: '',
    components: [
      { name: 'Tuition Fee', amount: 3500, frequency: 'TERMLY' },
      { name: 'Lab & Computer Fee', amount: 800, frequency: 'TERMLY' },
    ],
  });

  // Batch Invoice Generation
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    classId: '',
    feeStructureId: '',
    title: 'Term 1 Tuition & Operations Fee',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch metadata and telemetry
  const fetchMetadata = async () => {
    try {
      const [classRes, structRes, sumRes] = await Promise.all([
        apiClient.get('/academics/classes'),
        apiClient.get('/fees/structures'),
        apiClient.get('/fees/summary'),
      ]);
      if (classRes.data.success) setClasses(classRes.data.data);
      if (structRes.data.success) setStructures(structRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
    } catch (err) {
      console.error('Failed to load fees metadata', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch Invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.classId = classFilter;

      const res = await apiClient.get('/fees/invoices', { params });
      if (res.data.success) {
        setInvoices(res.data.data);
        if (res.data.pagination) setTotalInvoices(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, classFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  // Open Collect Payment
  const handleOpenCollect = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      amount: inv.balanceAmount,
      paymentMethod: 'CASH',
      transactionReference: '',
      notes: '',
    });
    setModalError('');
    setIsCollectModalOpen(true);
  };

  // Submit Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/fees/payments/collect', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
      });

      if (res.data.success) {
        setSuccessToast(`Payment of ₹${paymentForm.amount} recorded! Receipt: ${res.data.data.payment.receiptNumber}`);
        setIsCollectModalOpen(false);
        fetchInvoices();
        fetchMetadata();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  // View Invoice Details
  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const res = await apiClient.get(`/fees/invoices/${invoiceId}`);
      if (res.data.success) {
        setDetailedInvoice(res.data.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load invoice details', err);
    }
  };

  // Create Fee Structure
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/fees/structures', {
        ...structureForm,
        classId: structureForm.classId || null,
      });
      if (res.data.success) {
        setSuccessToast('New fee structure created successfully!');
        setIsStructureModalOpen(false);
        fetchMetadata();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate Invoices for Class
  const handleGenerateClassInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/fees/invoices/generate-class', generateForm);
      if (res.data.success) {
        setSuccessToast(`Generated ${res.data.data.generatedCount} invoices totaling ₹${res.data.data.totalBilled}!`);
        setIsGenerateModalOpen(false);
        fetchInvoices();
        fetchMetadata();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Invoice generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</div>
          <div className="text-[10px] text-slate-400">{inv.title}</div>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (inv) => (
        <div>
          <div className="font-semibold text-slate-800">
            {inv.studentId ? `${inv.studentId.firstName} ${inv.studentId.lastName}` : 'Unlinked Student'}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Adm: #{inv.studentId?.admissionNumber}</span>
            {inv.classId && <span>• {inv.classId.name}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'amounts',
      header: 'Total / Balance',
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-900">₹{inv.totalAmount.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">
            Due: <span className="font-semibold text-rose-600">₹{inv.balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => (
        <span className="text-slate-600 font-medium">
          {new Date(inv.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          PAID: 'success',
          PARTIAL: 'warning',
          PENDING: 'info',
          OVERDUE: 'danger',
          CANCELLED: 'danger',
        };
        return <Badge variant={variants[inv.status] || 'info'}>{inv.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-slate-800"
            onClick={() => handleViewInvoice(inv._id)}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {inv.status !== 'PAID' && (
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleOpenCollect(inv)}
            >
              Collect
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Fees & Accounts Management</h1>
            <Badge variant="info">Invoicing Engine</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Student fee billing, payment collection, receipts, and accounts telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchInvoices();
              fetchMetadata();
            }}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStructureModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Fee Structure
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateModalOpen(true)}
            leftIcon={<FilePlus className="w-4 h-4" />}
          >
            Batch Invoices
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button className="text-emerald-700 font-bold ml-4" onClick={() => setSuccessToast(null)}>
            ×
          </button>
        </div>
      )}

      {/* Financial Telemetry Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Billed</span>
              <DollarSign className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              ₹{summary.totalBilled?.toLocaleString() || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">{summary.totalInvoices} invoices generated</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Collected</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              ₹{summary.totalCollected?.toLocaleString() || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Realized payments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Outstanding Dues</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-amber-600">
              ₹{summary.totalOutstanding?.toLocaleString() || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Pending collections</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Overdue Accounts</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-bold text-rose-600">{summary.overdueCount || 0}</span>
            <p className="text-[11px] text-slate-400 mt-1">Passed invoice due date</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 shadow-subtle">
        <Tabs
          tabs={[
            { id: 'invoices', label: 'Invoices & Billing', icon: <Receipt className="w-4 h-4" /> },
            { id: 'structures', label: 'Fee Structures', icon: <Layers className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* TAB 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by invoice number or term..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2">
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
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'PARTIAL', label: 'Partial' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'OVERDUE', label: 'Overdue' },
                ]}
              />
            </div>
          </div>

          {/* Invoices Table */}
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            loading={loading}
            emptyTitle="No invoices generated yet"
            emptyDescription="Use 'Batch Invoices' above to generate fee invoices for an entire class."
            emptyIcon={<Receipt className="w-10 h-10 text-slate-300" />}
            pagination={{
              page,
              limit: 10,
              total: totalInvoices,
              totalPages: Math.ceil(totalInvoices / 10) || 1,
              onPageChange: (p) => setPage(p),
            }}
          />
        </div>
      )}

      {/* TAB 2: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {structures.map((st) => (
            <div
              key={st._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                  <Badge variant="info">{st.academicYear}</Badge>
                </div>

                <div className="text-xs text-slate-500 mb-3">
                  Applies to:{' '}
                  <span className="font-semibold text-slate-800">
                    {st.classId ? st.classId.name : 'All School Classes'}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Components
                  </span>
                  {st.components?.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-slate-700">
                      <span>{c.name}</span>
                      <span className="font-semibold">₹{Number(c.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Fee:</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{Number(st.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {structures.length === 0 && (
            <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
              No fee structures configured. Click 'Fee Structure' above to add your first template.
            </div>
          )}
        </div>
      )}

      {/* Collect Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title={`Collect Payment — ${selectedInvoice.invoiceNumber}`}
          size="sm"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Student:</span>
                <span className="font-semibold text-slate-900">
                  {selectedInvoice.studentId?.firstName} {selectedInvoice.studentId?.lastName}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Outstanding Balance:</span>
                <span className="font-bold text-rose-600">
                  ₹{selectedInvoice.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Input
              label="Payment Amount (₹) *"
              type="number"
              required
              min={1}
              max={selectedInvoice.balanceAmount}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
            />

            <Select
              label="Payment Method *"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
              options={[
                { value: 'CASH', label: 'Cash Receipt' },
                { value: 'UPI', label: 'UPI / QR Code' },
                { value: 'CARD', label: 'Debit / Credit Card' },
                { value: 'BANK_TRANSFER', label: 'Bank Wire / NEFT' },
                { value: 'CHEQUE', label: 'Cheque' },
              ]}
            />

            <Input
              label="Transaction Reference / Cheque No."
              placeholder="e.g. UPI-987123 or CHQ-00124"
              value={paymentForm.transactionReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsCollectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Details & Receipt Modal */}
      {detailedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Invoice ${detailedInvoice.invoiceNumber}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{detailedInvoice.title}</h3>
                <p className="text-xs text-slate-500">
                  Student: {detailedInvoice.studentId?.firstName} {detailedInvoice.studentId?.lastName} (Adm: #{detailedInvoice.studentId?.admissionNumber})
                </p>
              </div>
              <Badge variant={detailedInvoice.status === 'PAID' ? 'success' : 'warning'}>
                {detailedInvoice.status}
              </Badge>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-600 border-b border-slate-200 flex justify-between">
                <span>Fee Breakdown</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                {detailedInvoice.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between px-2 py-1.5 text-slate-700">
                    <span>{item.title}</span>
                    <span className="font-semibold">₹{Number(item.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 border-t border-slate-200 flex justify-between">
                <span>Total Amount</span>
                <span>₹{Number(detailedInvoice.totalAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment History */}
            {detailedInvoice.payments && detailedInvoice.payments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Recorded Receipts</h4>
                <div className="space-y-1.5 text-xs">
                  {detailedInvoice.payments.map((p: any) => (
                    <div
                      key={p._id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800 mr-2">{p.receiptNumber}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{p.paymentMethod.toLowerCase()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">₹{Number(p.amount).toLocaleString()}</span>
                        <div className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Invoices Generator Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Batch Invoice Generator"
        size="md"
      >
        <form onSubmit={handleGenerateClassInvoices} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Class *"
              value={generateForm.classId}
              onChange={(e) => setGenerateForm({ ...generateForm, classId: e.target.value })}
              options={[
                { value: '', label: 'Select class...' },
                ...classes.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Select
              label="Select Fee Structure *"
              value={generateForm.feeStructureId}
              onChange={(e) => setGenerateForm({ ...generateForm, feeStructureId: e.target.value })}
              options={[
                { value: '', label: 'Select fee template...' },
                ...structures.map((s) => ({ value: s._id, label: `${s.name} (₹${s.totalAmount})` })),
              ]}
            />
          </div>

          <Input
            label="Invoice Term / Title *"
            value={generateForm.title}
            onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
            placeholder="e.g. Term 1 Tuition & Lab Fees"
          />

          <Input
            label="Payment Due Date *"
            type="date"
            value={generateForm.dueDate}
            onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!generateForm.classId || !generateForm.feeStructureId}
              isLoading={submitting}
            >
              Generate Invoices
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fee Structure Creation Modal */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title="Create Fee Structure"
        size="md"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template Name *"
              required
              placeholder="e.g. Standard High School Fee"
              value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
            />
            <Input
              label="Academic Year *"
              required
              value={structureForm.academicYear}
              onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
            />
          </div>

          <Select
            label="Applicable Class (Leave blank for all)"
            value={structureForm.classId}
            onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
            options={[
              { value: '', label: 'All Classes (School-wide)' },
              ...classes.map((c) => ({ value: c._id, label: c.name })),
            ]}
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Fee Components</label>
            {structureForm.components.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Component Name"
                  value={c.name}
                  onChange={(e) => {
                    const comps = [...structureForm.components];
                    comps[i].name = e.target.value;
                    setStructureForm({ ...structureForm, components: comps });
                  }}
                  className="flex-1 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={c.amount}
                  onChange={(e) => {
                    const comps = [...structureForm.components];
                    comps[i].amount = Number(e.target.value);
                    setStructureForm({ ...structureForm, components: comps });
                  }}
                  className="w-28 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStructureModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Create Structure
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
