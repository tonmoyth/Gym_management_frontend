'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

import { memberApi } from '@/lib/api/member.api';
import { businessApi } from '@/lib/api/business.api';
import { trainerApi } from '@/lib/api/trainer.api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login({ email, password });

    if (result.success && result.user) {
      const { role, isPlatformStaff, staffBusiness } = result.user;

      // 1. Platform Super Admin, Admin, and Platform Staff operators
      if (
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        isPlatformStaff ||
        (role === 'STAFF' && !staffBusiness)
      ) {
        router.push('/admin/dashboard');
        return;
      }

      // 2. Gym Business Staff (assigned to a gym)
      if (role === 'STAFF') {
        router.push('/owner/dashboard');
        return;
      }
      else if (role === 'BUSINESS_OWNER') {
        if (result.user.hasBusiness) {
          router.push('/owner/dashboard');
          return;
        }
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
      else if (role === 'TRAINER') {
        try {
          const profRes = await trainerApi.getOwnProfile();
          const profile = profRes.data?.data;
          if (profile && (profile.profileCompletionPercent ?? 0) === 100) {
            router.push('/trainer/dashboard');
            return;
          }
        } catch {
          // Incomplete profile or initial login
        }
        router.push('/trainer/profile');
      }
      else {
        // MEMBER: check if profile already exists
        try {
          const profRes = await memberApi.getProfile();
          if (profRes.data?.success && profRes.data.data) {
            router.push('/member/dashboard');
            return;
          }
        } catch {
          // No profile found, redirect to onboarding
        }
        router.push('/onboarding');
      }
    } else {
      setError(result.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </span>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
