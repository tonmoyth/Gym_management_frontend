'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match (পাসওয়ার্ড দুটি মিলছে না)');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        email,
        otp: otp.trim(),
        newPassword,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(res.data?.message || 'Password reset failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to reset password. Please check your OTP code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-orange-600/15 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-lg shadow-orange-600/10">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          আপনার ইমেইলে প্রাপ্ত কোড এবং নতুন পাসওয়ার্ড প্রদান করুন
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-orange-500" />
          <span>পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! লগইন পেজে নিয়ে যাওয়া হচ্ছে...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!searchParams.get('email') && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address <span className="text-orange-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Verification Code (OTP) <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="123456"
            className="w-full py-2.5 px-3.5 text-center tracking-[0.25em] font-mono font-bold text-base bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            New Password (নতুন পাসওয়ার্ড) <span className="text-orange-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Confirm New Password (পাসওয়ার্ড নিশ্চিত করুন) <span className="text-orange-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-500 active:scale-[0.99] disabled:opacity-50 text-white shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>পাসওয়ার্ড পরিবর্তন হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>Reset Password (পরিবর্তন সম্পন্ন করুন)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login (লগইনে ফিরে যান)
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-400 py-12">লোড হচ্ছে...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
