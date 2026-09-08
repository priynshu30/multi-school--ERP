import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mb-4 shadow-subtle">
        <ShieldX className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">403 — Unauthorized Access</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
        Your account does not have sufficient permissions to view this resource. Multi-tenant security isolation prevents cross-role or cross-school escalation.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
