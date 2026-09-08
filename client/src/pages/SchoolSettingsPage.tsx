import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/authContext';
import {
  Settings,
  Building2,
  Globe,
  Palette,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const SchoolSettingsPage: React.FC = () => {
  const { school, refreshSchool } = useAuth() as any;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    academicYear: '2026-2027',
    attendanceType: 'biometric_and_manual',
    theme: 'emerald',
  });

  const fetchSchoolData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/schools/current');
      if (res.data.success) {
        const s = res.data.data;
        setForm({
          name: s.name || '',
          code: s.code || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          country: s.country || 'India',
          currency: s.currency || 'INR',
          timezone: s.timezone || 'Asia/Kolkata',
          academicYear: s.academicYear || '2026-2027',
          attendanceType: s.settings?.attendanceType || 'biometric_and_manual',
          theme: s.settings?.theme || 'emerald',
        });
      }
    } catch (err) {
      console.error('Failed to load current school settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        currency: form.currency,
        timezone: form.timezone,
        academicYear: form.academicYear,
        settings: {
          attendanceType: form.attendanceType,
          theme: form.theme,
        },
      };

      const res = await apiClient.put('/schools/current', payload);
      if (res.data.success) {
        setToastMessage('Institutional settings updated successfully!');
        if (refreshSchool) refreshSchool();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Institutional Configuration</h1>
            <Badge variant="info">Tenant ID: {form.code || school?.code || 'Active'}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Configure campus details, official credentials, timezone, currency, and academic calendar parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchoolData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
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

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button className="text-rose-700 font-bold ml-4" onClick={() => setErrorMessage(null)}>
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: School Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">Campus Profile & Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official School Name *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="School Code (System Tenant Key)"
              disabled
              value={form.code}
              className="bg-slate-50 cursor-not-allowed font-mono"
            />
            <Input
              label="Contact Email *"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Official Phone Number *"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <Input
                label="Physical Street Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State / Province"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
        </div>

        {/* Card 2: Academic & Regional Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">Academic & Localization Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Active Academic Calendar Year *"
              required
              placeholder="e.g. 2026-2027"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            />

            <Select
              label="Primary Financial Currency *"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              options={[
                { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
              ]}
            />

            <Select
              label="Campus Timezone *"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              options={[
                { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai (GST +4:00)' },
                { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                { value: 'America/New_York', label: 'America/New_York (EST)' },
                { value: 'Europe/London', label: 'Europe/London (GMT)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Select
              label="Attendance Capture Protocol"
              value={form.attendanceType}
              onChange={(e) => setForm({ ...form, attendanceType: e.target.value })}
              options={[
                { value: 'biometric_and_manual', label: 'Biometric Devices + Manual Override' },
                { value: 'manual', label: 'Manual Teacher Roster Only' },
                { value: 'biometric_only', label: 'Automated Biometric Device Gates Only' },
              ]}
            />

            <Select
              label="Portal Accent Theme"
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
              options={[
                { value: 'emerald', label: 'Emerald Green (Education Standard)' },
                { value: 'indigo', label: 'Royal Indigo' },
                { value: 'navy', label: 'Classic Deep Navy' },
              ]}
            />
          </div>
        </div>

        {/* Save bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Institutional Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
