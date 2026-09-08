import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600 mb-4 shadow-subtle">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">404 — Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
        The requested module or resource could not be found or does not exist on this tenant.
      </p>
      <Button variant="primary" onClick={() => navigate('/dashboard')}>
        Go to Home
      </Button>
    </div>
  );
};
