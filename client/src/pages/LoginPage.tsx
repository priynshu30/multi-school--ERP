import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Mail, Lock, School, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email.trim(), password.trim());
      // Determine redirection from local storage or default
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid credentials. Please check your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-card mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          EduScale ERP
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Multi-School Management SaaS Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border-slate-200 shadow-xl">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/60 flex items-start gap-2.5 text-xs text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Sign In to Portal
              </Button>
            </form>

            {/* Demo Quick-Fill Section */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>One-Click Demo Credentials</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('superadmin@erp.com')}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all text-xs flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">Super Admin</span>
                    <span className="text-slate-400 text-[11px]">superadmin@erp.com</span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Fill & Test <CheckCircle2 className="w-3 h-3" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@greenvalley.edu')}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">School A Admin (Green Valley)</span>
                    <span className="text-slate-400 text-[11px]">admin@greenvalley.edu</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Fill & Test <CheckCircle2 className="w-3 h-3" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@horizon.edu')}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">School B Admin (Horizon Intl)</span>
                    <span className="text-slate-400 text-[11px]">admin@horizon.edu</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Fill & Test <CheckCircle2 className="w-3 h-3" />
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          Multi-Tenant Isolation Enforced • Sprint 1 Foundation
        </p>
      </div>
    </div>
  );
};
