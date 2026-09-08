import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Settings,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  Lock,
  Cpu,
  Save,
  Server,
} from 'lucide-react';

export const PlatformSettingsPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [plans, setPlans] = useState([
    {
      id: 'basic',
      name: 'Starter / Basic Plan',
      price: '₹7,999 / mo',
      maxStudents: 300,
      maxStaff: 30,
      features: ['Core Academics', 'Manual Attendance', 'Standard Fees', 'Parent Portal'],
      badge: 'Starter',
    },
    {
      id: 'pro',
      name: 'Professional Tier',
      price: '₹19,999 / mo',
      maxStudents: 1500,
      maxStaff: 120,
      features: [
        'Biometric Attendance Sync',
        'Live GPS Bus Tracking',
        'Online Fee Gateways',
        'Full Timetable Conflict Engine',
      ],
      badge: 'Popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      price: '₹49,999 / mo',
      maxStudents: 'Unlimited',
      maxStaff: 'Unlimited',
      features: [
        'Multi-Campus Support',
        'Unlimited Storage & Backups',
        'Dedicated SLA & Support',
        'Full Telemetry & Custom Integrations',
      ],
      badge: 'Enterprise',
    },
  ]);

  const [platformConfig, setPlatformConfig] = useState({
    sessionTimeoutMinutes: 60,
    maxFileUploadMB: 10,
    requireTwoFactorForAdmins: false,
    strictTenantIsolation: true,
    telemetryLogging: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Platform system parameters saved successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Platform System Configuration</h1>
            <Badge variant="info">Global Parameters</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Define subscription tiers, maximum resource ceilings, tenant security guardrails, and telemetry settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
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

      {/* Subscription Plans */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-800">SaaS Multi-Tenant Subscription Tiers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Badge variant={plan.id === 'enterprise' ? 'success' : 'info'} size="sm">
                    {plan.badge}
                  </Badge>
                  <span className="font-bold text-base text-slate-900">{plan.price}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Ceilings: {plan.maxStudents} Students • {plan.maxStaff} Staff
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Infrastructure & Security Parameters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Tenant Security & Infrastructure Parameters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" /> Strict Tenant Isolation Mode
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Enforces mandatory schoolId filtering in all Mongoose repository queries and middleware layers.
            </p>
            <div className="pt-2">
              <Badge variant="success">Enforced & Active</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-600" /> Live GPS & Socket.IO Engine
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Streams real-time bus telemetry updates to subscribed parent portals using WebSocket channels.
            </p>
            <div className="pt-2">
              <Badge variant="success">Operational</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" /> Session Expiry Ceiling
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Maximum idle token duration before requiring re-authentication: 60 minutes.
            </p>
            <div className="pt-2">
              <Badge variant="info">JWT Refresh Enabled</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" /> Document Storage Threshold
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Maximum individual document upload limit for homework, receipts, and student photo files: 10 MB.
            </p>
            <div className="pt-2">
              <Badge variant="info">10 MB Per Asset</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
