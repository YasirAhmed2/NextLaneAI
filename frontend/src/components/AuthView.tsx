import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser } from '../types';
import { authService } from '../services/authService';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'otp' | 'forgot';
  onAuthSuccess: (user: AuthUser, isNewRegistration?: boolean) => void;
  onCancel: () => void;
  theme?: 'dark' | 'light';
}

type AuthMode = 'login' | 'register' | 'otp' | 'forgot_request' | 'forgot_verify' | 'forgot_reset';

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode === 'register' ? 'register' : 'login');
  
  // Registration & Login Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetTicket, setResetTicket] = useState('');

  // Status & Error Messages
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Switch tabs
  const handleSwitchMode = (newMode: AuthMode) => {
    clearMessages();
    setMode(newMode);
  };

  // 1. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim()) {
      setErrorMessage('Please enter a username (minimum 3 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register(username.trim(), email.trim(), password);
      setOtpTargetEmail(email.trim().toLowerCase());
      setResendCooldown(60);
      if (result.devOtpHint) {
        setDevOtpHint(result.devOtpHint);
      }
      setSuccessMessage(`Verification code sent to ${email.trim()}`);
      setMode('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(username.trim(), password);
      if (result.requiresVerification && result.email) {
        setOtpTargetEmail(result.email);
        setResendCooldown(45);
        if (result.devOtpHint) setDevOtpHint(result.devOtpHint);
        setErrorMessage('Your email is not verified yet. A verification code has been dispatched.');
        setMode('otp');
        return;
      }

      if (result.user) {
        onAuthSuccess(result.user, false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle OTP input change & paste
  const handleOtpDigitChange = (index: number, value: string) => {
    clearMessages();
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpCode];
    updated[index] = cleanVal;
    setOtpCode(updated);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    clearMessages();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split('');
    const updated = [...otpCode];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || '';
    }
    setOtpCode(updated);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // 4. Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(otpTargetEmail, code);
      setSuccessMessage('Email verified successfully! Setting up your profile...');
      setTimeout(() => {
        onAuthSuccess(result.user, true);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async (purpose: 'registration' | 'reset' = 'registration') => {
    if (resendCooldown > 0) return;
    clearMessages();
    setIsLoading(true);
    try {
      const emailToUse = purpose === 'reset' ? resetEmail : otpTargetEmail;
      const res = await authService.resendOtp(emailToUse, purpose);
      setResendCooldown(60);
      if (res.devOtpHint) setDevOtpHint(res.devOtpHint);
      setSuccessMessage(`Fresh verification code sent to ${emailToUse}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Forgot Password - Step A: Request code
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.requestPasswordReset(resetEmail.trim().toLowerCase());
      setResendCooldown(60);
      if (res.devOtpHint) setDevOtpHint(res.devOtpHint);
      setSuccessMessage(`If an account exists, a reset code was sent to ${resetEmail.trim()}`);
      setOtpCode(['', '', '', '', '', '']);
      setMode('forgot_verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Forgot Password - Step B: Verify reset code
  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyPasswordResetCode(resetEmail.trim().toLowerCase(), code);
      if (res.resetTicket) setResetTicket(res.resetTicket);
      setSuccessMessage('Code verified! Please create your new password.');
      setMode('forgot_reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Forgot Password - Step C: Set new password
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const code = otpCode.join('');
      const res = await authService.resetPassword(resetEmail.trim().toLowerCase(), code, newPassword);
      setSuccessMessage(res.message || 'Password updated successfully! You can now log in.');
      setPassword('');
      setUsername(resetEmail.trim());
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[#D4AF37]/35 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] p-5 sm:p-8 my-auto relative"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close authentication modal"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#E5C158] text-[#1C1C1C] shadow-lg shadow-[#D4AF37]/20 mb-3">
            <span className="material-symbols-outlined text-2xl font-bold">insights</span>
          </div>
          <h2 className="font-poppins text-2xl font-bold text-[var(--text)] tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'otp' && 'Verify Your Email'}
            {mode === 'forgot_request' && 'Reset Password'}
            {mode === 'forgot_verify' && 'Enter Reset Code'}
            {mode === 'forgot_reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'Log in to access your curated opportunity pipeline.'}
            {mode === 'register' && 'Join NextLane AI to discover tailored grants, internships, and hackathons.'}
            {mode === 'otp' && `Enter the 6-digit code sent to ${otpTargetEmail}`}
            {mode === 'forgot_request' && 'Enter your email address to receive a secure recovery code.'}
            {mode === 'forgot_verify' && `Enter the recovery code sent to ${resetEmail}`}
            {mode === 'forgot_reset' && 'Create a secure password with at least 6 characters.'}
          </p>
        </div>

        {/* Top Mode Tabs for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex rounded-xl bg-[var(--bg-subtle)] p-1 border border-[var(--border)] mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--card-bg)] text-[#B38600] dark:text-[#D4AF37] shadow-sm border border-[#D4AF37]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[var(--card-bg)] text-[#B38600] dark:text-[#D4AF37] shadow-sm border border-[#D4AF37]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alert Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2 mb-4"
            >
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 mb-4"
            >
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev OTP Helper Banner for quick preview testing */}
        {devOtpHint && (
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B38600] dark:text-[#D4AF37] text-xs font-semibold flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">mark_email_read</span>
              <span>Verification Code: <strong className="tracking-widest font-mono text-sm">{devOtpHint}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                const digits = devOtpHint.split('');
                setOtpCode(digits);
              }}
              className="text-[10px] underline uppercase tracking-wider font-bold cursor-pointer hover:opacity-80"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* FORM 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alexrivera"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot_request')}
                  className="text-[11px] text-[#B38600] dark:text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 2: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  badge
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  lock_reset
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 3: OTP VERIFICATION */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-center gap-1.5 min-[380px]:gap-2 sm:gap-2.5 mb-3">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={idx === 0}
                    className="w-9 h-11 min-[380px]:w-11 min-[380px]:h-13 sm:w-12 sm:h-14 text-center text-base sm:text-xl font-bold bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-all shrink-0"
                  />
                ))}
              </div>
              <p className="text-[11px] text-center text-[var(--text-muted)]">
                You can paste the complete 6-digit code.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Start Discovery</span>
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="text-[var(--text-secondary)] hover:text-[var(--text)] underline cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleResendOtp('registration')}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[#B38600] dark:text-[#D4AF37] font-bold hover:underline disabled:opacity-40 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* FORM 4: FORGOT PASSWORD - REQUEST */}
        {mode === 'forgot_request' && (
          <form onSubmit={handleForgotRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5">
                Your Account Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  mail
                </span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <span className="material-symbols-outlined text-sm font-bold">send</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)] underline cursor-pointer"
              >
                Back to Log In
              </button>
            </div>
          </form>
        )}

        {/* FORM 5: FORGOT PASSWORD - VERIFY CODE */}
        {mode === 'forgot_verify' && (
          <form onSubmit={handleForgotVerify} className="space-y-5">
            <div>
              <div className="flex justify-center gap-1.5 min-[380px]:gap-2 sm:gap-2.5 mb-3">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={idx === 0}
                    className="w-9 h-11 min-[380px]:w-11 min-[380px]:h-13 sm:w-12 sm:h-14 text-center text-base sm:text-xl font-bold bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-all shrink-0"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSwitchMode('forgot_request')}
                className="text-[var(--text-secondary)] hover:text-[var(--text)] underline cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleResendOtp('reset')}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[#B38600] dark:text-[#D4AF37] font-bold hover:underline disabled:opacity-40 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* FORM 6: FORGOT PASSWORD - SET NEW PASSWORD */}
        {mode === 'forgot_reset' && (
          <form onSubmit={handleForgotReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                  lock_reset
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
