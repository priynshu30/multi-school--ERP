import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  X,
  Smartphone,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  // Empty credentials by default so user can type their own credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('123456');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { login, sendOtp, loginWithOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: any;
    if (otpModalOpen && otpStep === 'verify' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpModalOpen, otpStep, resendTimer]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
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

  // Open OTP modal and send code
  const handleStartOtpLogin = async () => {
    setError('');
    setOtpError('');
    setOtpCode('');
    const target = email.trim().toLowerCase();

    // If user hasn't typed an email yet, open modal on the 'input' step
    if (!target) {
      setOtpIdentifier('');
      setOtpStep('input');
      setOtpModalOpen(true);
      return;
    }

    setOtpIdentifier(target);
    setOtpModalOpen(true);
    setIsSendingOtp(true);

    try {
      const res = await sendOtp(target);
      setOtpStep('verify');
      setOtpSuccessMessage(res.message);
      setDemoOtpHint(res.demoOtp || '123456');
      setResendTimer(60);
    } catch (err: any) {
      setOtpError(err.message || 'Unable to send OTP. Please check your email.');
      setOtpStep('input');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setOtpError('');
    setIsSendingOtp(true);
    try {
      const res = await sendOtp(otpIdentifier.trim());
      setOtpSuccessMessage(res.message);
      setDemoOtpHint(res.demoOtp || '123456');
      setResendTimer(60);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP and complete login
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = otpCode.trim();
    if (!clean || clean.length < 4) {
      setOtpError('Please enter a valid OTP code (e.g. 123456)');
      return;
    }

    setOtpError('');
    setIsVerifyingOtp(true);

    try {
      await loginWithOtp(otpIdentifier.trim(), clean);
      setOtpModalOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Use code 123456.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 1-Click Auto Fill Demo OTP
  const handleAutoFillOtp = () => {
    setOtpCode(demoOtpHint);
    setOtpError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 transition-colors duration-200 relative">
      {/* ================= TOP RIGHT THEME TOGGLE ================= */}
      <div className="absolute top-4 right-4 z-40">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold pr-1">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold pr-1">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* ================= LEFT SIDE: BRANDING & ILLUSTRATION ================= */}
      <div className="w-full lg:w-1/2 bg-[#f0f6ff] dark:bg-slate-900/80 flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              School <span className="text-blue-600">ERP</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Manage · Connect · Grow
            </p>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="my-6 lg:my-auto max-w-lg z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
            Smarter Education <br className="hidden sm:inline" />
            <span className="text-slate-800 dark:text-slate-300">for a Brighter Future</span>
          </h2>
          <p className="mt-3 text-xs sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            Complete school management in one place — for students, parents, teachers, and staff.
          </p>

          {/* School Vector Illustration - visible on tablet & desktop */}
          <div className="hidden md:flex mt-6 sm:mt-10 lg:mt-12 justify-center items-end">
            <svg
              viewBox="0 0 540 320"
              className="w-full max-w-[480px] drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Sky & Hill Background */}
              <ellipse cx="270" cy="270" rx="260" ry="80" fill="#e2edf8" className="dark:fill-slate-800" />
              <ellipse cx="270" cy="285" rx="270" ry="70" fill="#cbe3f7" className="dark:fill-slate-800/60" />

              {/* Distant Trees & Greenery */}
              <circle cx="80" cy="220" r="45" fill="#a7d7a9" className="dark:opacity-80" />
              <circle cx="125" cy="210" r="35" fill="#8bc34a" className="dark:opacity-80" />
              <circle cx="420" cy="215" r="42" fill="#a7d7a9" className="dark:opacity-80" />
              <circle cx="465" cy="225" r="36" fill="#8bc34a" className="dark:opacity-80" />

              {/* School Main Building Body */}
              <rect x="150" y="160" width="240" height="110" rx="6" fill="#ffffff" className="dark:fill-slate-800" />
              <rect x="150" y="160" width="240" height="110" rx="6" stroke="#d5e3ec" strokeWidth="2" className="dark:stroke-slate-700" />

              {/* Roofs */}
              <polygon points="140,162 270,162 260,140 150,140" fill="#3b82f6" />
              <polygon points="270,162 400,162 390,140 280,140" fill="#2563eb" />

              {/* Central Tower */}
              <rect x="235" y="110" width="70" height="60" fill="#ffffff" stroke="#d5e3ec" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <polygon points="230,112 270,68 310,112" fill="#1d4ed8" />

              {/* Flagpole & Flag */}
              <line x1="270" y1="68" x2="270" y2="40" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <polygon points="270,42 295,48 270,55" fill="#3b82f6" />

              {/* Clock on Central Tower */}
              <circle cx="270" cy="95" r="14" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" className="dark:fill-slate-900" />
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
              <rect x="175" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="186" y1="180" x2="186" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="175" y1="193" x2="197" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="205" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="216" y1="180" x2="216" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="205" y1="193" x2="227" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="175" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="186" y1="225" x2="186" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="175" y1="238" x2="197" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="205" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="216" y1="225" x2="216" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="205" y1="238" x2="227" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              {/* Classroom Windows Right Side */}
              <rect x="313" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="324" y1="180" x2="324" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="313" y1="193" x2="335" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="343" y="180" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="354" y1="180" x2="354" y2="206" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="343" y1="193" x2="365" y2="193" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="313" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="324" y1="225" x2="324" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="313" y1="238" x2="335" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              <rect x="343" y="225" width="22" height="26" rx="2" fill="#60a5fa" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />
              <line x1="354" y1="225" x2="354" y2="251" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="343" y1="238" x2="365" y2="238" stroke="#ffffff" strokeWidth="1.5" />

              {/* Front Steps */}
              <rect x="238" y="268" width="64" height="4" fill="#94a3b8" rx="1" />
              <rect x="232" y="272" width="76" height="4" fill="#64748b" rx="1" />

              {/* Foreground Desk with Books */}
              <polygon points="0,290 190,265 195,320 0,320" fill="#d97706" />
              <polygon points="0,285 190,260 190,268 0,292" fill="#f59e0b" />

              <rect x="10" y="265" width="95" height="15" rx="3" fill="#1e3a8a" />
              <rect x="15" y="267" width="85" height="11" rx="1" fill="#f8fafc" />
              <rect x="12" y="250" width="90" height="15" rx="3" fill="#ea580c" />
              <rect x="17" y="252" width="80" height="11" rx="1" fill="#fef08a" />
              <rect x="15" y="235" width="85" height="15" rx="3" fill="#0284c7" />
              <rect x="20" y="237" width="75" height="11" rx="1" fill="#ffffff" />

              <rect x="115" y="248" width="36" height="42" rx="4" fill="#2563eb" />
              <line x1="124" y1="250" x2="120" y2="225" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
              <line x1="132" y1="250" x2="132" y2="220" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <line x1="140" y1="250" x2="145" y2="230" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Left Footer info */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Multi-School Cloud ERP • High Security Tenant Architecture
        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 lg:p-16">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Login</span> to your School ERP account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpIdentifier(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:outline-none transition-all shadow-2xs"
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:outline-none transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('To reset your password, contact your school administrator or superadmin@erp.com');
                }}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
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
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <span className="relative bg-white dark:bg-slate-950 px-3 text-xs text-slate-400 font-medium">or</span>
          </div>

          {/* Login with OTP Button */}
          <button
            type="button"
            onClick={handleStartOtpLogin}
            className="w-full py-3 px-4 bg-[#eff6ff] dark:bg-blue-950/30 hover:bg-[#e0efff] dark:hover:bg-blue-900/40 active:bg-[#dbeafe] text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Login with OTP</span>
          </button>

          {/* Contact Administrator Link */}
          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Not a member?{' '}
            <a
              href="#contact-admin"
              onClick={(e) => {
                e.preventDefault();
                alert('For new school registrations or account access, please reach out to priyanshukumarr444@gmail.com');
              }}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact Administrator
            </a>
          </div>
        </div>
      </div>

      {/* ================= FUNCTIONAL OTP MODAL ================= */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Login with OTP
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Instant passwordless verification
                </p>
              </div>
            </div>

            {/* OTP Error message */}
            {otpError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Step 1: Input Identifier */}
            {otpStep === 'input' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your registered school email address or mobile number to receive a one-time verification code:
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or mobile"
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!otpIdentifier.trim()) {
                        setOtpError('Please enter your email or username');
                        return;
                      }
                      setOtpError('');
                      setIsSendingOtp(true);
                      try {
                        const res = await sendOtp(otpIdentifier.trim());
                        setOtpStep('verify');
                        setOtpSuccessMessage(res.message);
                        setDemoOtpHint(res.demoOtp || '123456');
                        setResendTimer(60);
                      } catch (err: any) {
                        setOtpError(err.message || 'Failed to send OTP');
                      } finally {
                        setIsSendingOtp(false);
                      }
                    }}
                    disabled={isSendingOtp}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSendingOtp ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enter & Verify OTP */}
            {otpStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Target email info & change option */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                      Code sent to: <span className="font-bold text-slate-900 dark:text-white">{otpIdentifier}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input');
                      setOtpError('');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Demo OTP Banner with 1-Click Auto Fill */}
                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-xs text-blue-900 dark:text-blue-200">
                      Demo OTP: <span className="font-bold tracking-wider">{demoOtpHint}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    ⚡ Auto Fill
                  </button>
                </div>

                {/* OTP Code Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                      setOtpError('');
                    }}
                    className="w-full text-center tracking-[0.4em] text-2xl font-bold py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
                  />
                </div>

                {/* Resend OTP button & Timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      Resend in <span className="font-bold text-slate-600 dark:text-slate-300">{resendTimer}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="flex-1 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || !otpCode}
                    className="flex-1 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
