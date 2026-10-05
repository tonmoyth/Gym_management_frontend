'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

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
        <h2 className="text-2xl font-black text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Email Address (ইমেইল ঠিকানা) <span className="text-orange-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Password (পাসওয়ার্ড) <span className="text-orange-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Submit Button */}
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
              <span>Sign In (লগইন)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        নতুন অ্যাকাউন্ট তৈরি করতে চান?{' '}
        <Link
          href="/register"
          className="font-bold text-orange-400 hover:text-orange-300 hover:underline transition-colors"
        >
          Create account (রেজিস্ট্রেশন)
        </Link>
      </div>
    </div>
  );
}
