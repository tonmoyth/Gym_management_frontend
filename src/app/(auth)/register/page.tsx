'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { Role } from '@/types/api.types';
import { AlertCircle, Dumbbell, Building2, Award, ArrowRight, Loader2, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('MEMBER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any previous session so a new registration starts clean
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.register({
        fullName,
        email,
        password,
        role,
      });

      if (res.data?.success) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to register. Please check your information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions: { value: Role; label: string; subLabel: string; icon: React.ReactNode }[] = [
    { value: 'MEMBER', label: 'Member', subLabel: 'সদস্য', icon: <Dumbbell className="w-4 h-4" /> },
    { value: 'BUSINESS_OWNER', label: 'Gym Owner', subLabel: 'জিম মালিক', icon: <Building2 className="w-4 h-4" /> },
    { value: 'TRAINER', label: 'Trainer', subLabel: 'ট্রেইনার', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Create an Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ফিটনেস ইকোসিস্টেমে যুক্ত হতে আপনার তথ্য প্রদান করুন
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-xs font-medium text-orange-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          আপনি যুক্ত হচ্ছেন হিসেবে: <span className="text-orange-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                role === opt.value
                  ? 'border-orange-500 bg-orange-600/15 text-orange-400 shadow-md shadow-orange-600/20'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${role === opt.value ? 'text-orange-400' : 'text-slate-500'}`}>
                {opt.icon}
              </div>
              <span className="font-bold">{opt.label}</span>
              <span className="text-[10px] font-normal text-slate-500">{opt.subLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Full Name (পূর্ণ নাম) <span className="text-orange-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="আপনার পূর্ণ নাম লিখুন"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Email Address */}
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

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Password (পাসওয়ার্ড - কমপক্ষে ৬ অক্ষর) <span className="text-orange-500">*</span>
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
              <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>Continue (পরবর্তী ধাপ)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
        <Link
          href="/login"
          className="font-bold text-orange-400 hover:text-orange-300 hover:underline transition-colors"
        >
          Sign In (লগইন)
        </Link>
      </div>
    </div>
  );
}
