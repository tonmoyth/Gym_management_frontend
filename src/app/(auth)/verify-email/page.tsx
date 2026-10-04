'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth.api';
import { businessApi } from '@/lib/api/business.api';
import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';

function VerifyEmailContent() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.verifyEmail({ email, otp: otp.trim() });
      if (res.data?.success) {
        await refreshUser();
        const role = res.data.data?.role;
        if (role === 'BUSINESS_OWNER') {
          try {
            const myBizRes = await businessApi.getMyBusiness();
            if (myBizRes.data?.success && myBizRes.data.data) {
              router.push('/owner/dashboard');
              return;
            }
          } catch {
            // No business created yet
          }
          router.push('/owner/setup');
        }
        else if (role === 'TRAINER') router.push('/trainer/profile');
        else if (role === 'SUPER_ADMIN' || role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'STAFF') {
          router.push('/admin/dashboard');
        }
        else router.push('/onboarding');
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
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <MailCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Verify your email
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          We sent a 6-digit verification code to {email || 'your email'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!searchParams.get('email') && (
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <Input
          label="6-Digit Verification Code"
          type="text"
          required
          maxLength={6}
          placeholder="123456"
          className="text-center tracking-widest text-lg font-mono"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Verify & Continue
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500">
        Didn&apos;t receive the code?{' '}
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
        >
          {isResending ? 'Resending...' : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-400 py-12">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
