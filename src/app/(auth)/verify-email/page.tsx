'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { businessApi } from '@/lib/api/business.api';
import { AlertCircle, CheckCircle2, MailCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.verifyEmail({ email, otp: otp.trim() });
      if (res.data?.success) {
        await refreshUser();
        const userData = res.data.data;
        const role = (userData as any)?.role || (userData as any)?.user?.role;

        if (role === 'BUSINESS_OWNER') {
          try {
            const myBizRes = await businessApi.getMyBusiness();
            if (myBizRes.data?.success && myBizRes.data.data) {
              window.location.href = '/owner/dashboard';
              return;
            }
          } catch {
            // No business created yet
          }
          window.location.href = '/owner/setup';
        } else if (role === 'TRAINER') {
          window.location.href = '/trainer/profile';
        } else if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'STAFF') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/onboarding';
        }
      } else {
        setError(res.data?.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your email address first.');
      return;
    }
    setIsResending(true);
    setError(null);
    try {
      await authApi.resendVerificationOtp(email);
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-orange-600/15 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-lg shadow-orange-600/10">
          <MailCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          আপনার ইমেইলে ৬ ডিজিটের ভেরিফিকেশন ওটিপি কোড পাঠানো হয়েছে: <span className="text-orange-400 font-semibold">{email || 'your email'}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!searchParams.get('email') && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address <span className="text-orange-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            6-Digit Verification Code (৬ সংখ্যার কোড) <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full py-3 px-3.5 text-center tracking-[0.3em] text-xl font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-500 active:scale-[0.99] disabled:opacity-50 text-white shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>যাচাই করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue (যাচাই সম্পন্ন করুন)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-400">
        কোড পাননি?{' '}
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="font-bold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isResending ? 'পাঠানো হচ্ছে...' : 'Resend Code (পুনরায় পাঠান)'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-400 py-12">লোড হচ্ছে...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
