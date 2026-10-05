'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth.api';
import { Role } from '@/types/api.types';
import { AlertCircle, Dumbbell, Building2, Award } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('MEMBER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Referral system temporarily disabled - will be implemented later
  // const [referralCode, setReferralCode] = useState('');
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
        // referralCode: referralCode.trim() || undefined, // Referral system temporarily disabled
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

  const roleOptions: { value: Role; label: string; icon: React.ReactNode }[] = [
    { value: 'MEMBER', label: 'Member', icon: <Dumbbell className="w-4 h-4" /> },
    { value: 'BUSINESS_OWNER', label: 'Gym Owner', icon: <Building2 className="w-4 h-4" /> },
    { value: 'TRAINER', label: 'Trainer', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Join the fitness ecosystem today
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Picker */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          I am a:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                role === opt.value
                  ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password (min. 6 characters)"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Referral system temporarily disabled - will be implemented later
        <Input
          label="Referral Code (optional)"
          type="text"
          placeholder="e.g. GYM-ABCDE"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        */}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Continue
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
