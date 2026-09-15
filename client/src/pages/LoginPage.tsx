import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('superadmin@erp.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.message || 'Invalid credentials. Please check your username and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string = 'Admin@123') => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  };

  const handleOtpLogin = () => {
    if (!email) {
      setError('Please enter your email or username first.');
      return;
    }
    setOtpModalOpen(true);
    setOtpSent(true);
  };

  const verifyOtpAndLogin = async () => {
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter a valid OTP code (e.g. 1234)');
      return;
    }
    setIsLoading(true);
    try {
      // Login with demo fallback
      await login(email.trim(), 'Admin@123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
      setOtpModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* ================= LEFT SIDE: BRANDING & ILLUSTRATION ================= */}
      <div className="w-full lg:w-1/2 bg-[#f0f6ff] flex flex-col justify-between p-8 sm:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              School <span className="text-blue-600">ERP</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
              Manage · Connect · Grow
            </p>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="my-8 lg:my-auto max-w-lg z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            Smarter Education <br />
            <span className="text-slate-800">for a Brighter Future</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed max-w-md">
            Complete school management in one place — for students, parents, teachers, and staff.
          </p>

          {/* School Vector Illustration */}
          <div className="mt-8 sm:mt-12 flex justify-center items-end">
            <svg
              viewBox="0 0 540 320"
              className="w-full max-w-[480px] drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Sky & Hill Background */}
              <ellipse cx="270" cy="270" rx="260" ry="80" fill="#e2edf8" />
              <ellipse cx="270" cy="285" rx="270" ry="70" fill="#cbe3f7" />

              {/* Distant Trees & Greenery */}
              <circle cx="80" cy="220" r="45" fill="#a7d7a9" />
              <circle cx="125" cy="210" r="35" fill="#8bc34a" />
              <circle cx="420" cy="215" r="42" fill="#a7d7a9" />
              <circle cx="465" cy="225" r="36" fill="#8bc34a" />

              {/* School Main Building Body */}
              <rect x="150" y="160" width="240" height="110" rx="6" fill="#ffffff" />
              <rect x="150" y="160" width="240" height="110" rx="6" stroke="#d5e3ec" strokeWidth="2" />

              {/* Left Wing Roof & Right Wing Roof */}
              <polygon points="140,162 270,162 260,140 150,140" fill="#3b82f6" />
              <polygon points="270,162 400,162 390,140 280,140" fill="#2563eb" />

              {/* Central Tower */}
              <rect x="235" y="110" width="70" height="60" fill="#ffffff" stroke="#d5e3ec" strokeWidth="2" />
              {/* Central Gable / Triangle Roof */}
              <polygon points="230,112 270,68 310,112" fill="#1d4ed8" />

              {/* Flagpole & Flag */}
              <line x1="270" y1="68" x2="270" y2="40" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <polygon points="270,42 295,48 270,55" fill="#3b82f6" />

              {/* Clock on Central Tower */}
              <circle cx="270" cy="95" r="14" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />
              {/* Clock Hands */}
              <line x1="270" y1="95" x2="270" y2="88" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
              <line x1="270" y1="95" x2="276" y2="95" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />

              {/* "SCHOOL" Sign */}
              <rect x="236" y="176" width="68" height="18" rx="3" fill="#2563eb" />
              <text
                x="270"
                y="189"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                letterSpacing="1.5"
                fontFamily="sans-serif"
              >
                SCHOOL
              </text>

              {/* Main Entrance Double Doors */}
              <rect x="246" y="215" width="48" height="55" rx="3" fill="#1e293b" />
              <line x1="270" y1="215" x2="270" y2="270" stroke="#334155" strokeWidth="2" />
              <circle cx="265" cy="245" r="2" fill="#94a3b8" />
              <circle cx="275" cy="245" r="2" fill="#94a3b8" />

              {/* Classroom Windows Left Side */}
              <rect x="175" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="186" y1="180" x2="186" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="175" y1="193" x2="197" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="205" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="216" y1="180" x2="216" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="205" y1="193" x2="227" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="175" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="186" y1="225" x2="186" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="175" y1="238" x2="197" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="205" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="216" y1="225" x2="216" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="205" y1="238" x2="227" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              {/* Classroom Windows Right Side */}
              <rect x="313" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="324" y1="180" x2="324" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="313" y1="193" x2="335" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="343" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="354" y1="180" x2="354" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="343" y1="193" x2="365" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="313" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="324" y1="225" x2="324" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="313" y1="238" x2="335" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="343" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="354" y1="225" x2="354" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="343" y1="238" x2="365" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              {/* Front Lawn / Steps */}
              <rect x="238" y="268" width="64" height="4" fill="#94a3b8" rx="1" />
              <rect x="232" y="272" width="76" height="4" fill="#64748b" rx="1" />

              {/* Foreground Table Surface */}
              <polygon points="0,290 190,265 195,320 0,320" fill="#d97706" />
              <polygon points="0,285 190,260 190,268 0,292" fill="#f59e0b" />

              {/* Stack of Books on Table */}
              {/* Bottom Book (Navy) */}
              <rect x="10" y="265" width="95" height="15" rx="3" fill="#1e3a8a" />
              <rect x="15" y="267" width="85" height="11" rx="1" fill="#f8fafc" />
              {/* Middle Book (Orange) */}
              <rect x="12" y="250" width="90" height="15" rx="3" fill="#ea580c" />
              <rect x="17" y="252" width="80" height="11" rx="1" fill="#fef08a" />
              {/* Top Book (Light Blue) */}
              <rect x="15" y="235" width="85" height="15" rx="3" fill="#0284c7" />
              <rect x="20" y="237" width="75" height="11" rx="1" fill="#ffffff" />

              {/* Pencil Holder Cup */}
              <rect x="115" y="248" width="36" height="42" rx="4" fill="#2563eb" />
              {/* Pencils and Pens sticking out */}
              <line x1="124" y1="250" x2="120" y2="225" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
              <line x1="132" y1="250" x2="132" y2="220" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <line x1="140" y1="250" x2="145" y2="230" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Left Footer info */}
        <div className="text-[11px] text-slate-400 font-medium">
          Multi-School Cloud ERP • High Security Tenant Architecture
        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">Login</span> to your School ERP account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                placeholder="Username / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('To reset your password, contact your school administrator or superadmin@erp.com');
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
          </div>

          {/* Login with OTP Button */}
          <button
            type="button"
            onClick={handleOtpLogin}
            className="w-full py-3 px-4 bg-[#eff6ff] hover:bg-[#e0efff] active:bg-[#dbeafe] text-blue-600 border border-blue-100 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Login with OTP</span>
          </button>

          {/* Contact Administrator Link */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Not a member?{' '}
            <a
              href="#contact-admin"
              onClick={(e) => {
                e.preventDefault();
                alert('For new school registrations or account access, please reach out to admin@erp.com');
              }}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Contact Administrator
            </a>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>One-Click Demo Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('superadmin@erp.com')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  email === 'superadmin@erp.com'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@greenvalley.edu')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  email === 'admin@greenvalley.edu'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                School Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher@greenvalley.edu')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  email === 'teacher@greenvalley.edu'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Enter OTP Verification</h3>
            <p className="text-xs text-slate-500 mt-1">
              A 4-digit code has been simulated for <span className="font-medium text-slate-700">{email}</span>. Use demo code <span className="font-bold text-blue-600">1234</span>.
            </p>

            <div className="my-5">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="1234"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-bold py-3 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtpAndLogin}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Verify & Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
