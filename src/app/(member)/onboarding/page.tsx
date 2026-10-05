'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { memberApi } from '@/lib/api/member.api';
import { specializationTagApi } from '@/lib/api/specializationTag.api';
import { SpecializationTag } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import {
  Target,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [specializations, setSpecializations] = useState<SpecializationTag[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [isFetchingTags, setIsFetchingTags] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkExistingProfileAndFetchTags() {
      // If member profile already exists, route directly to dashboard
      try {
        const profRes = await memberApi.getProfile();
        if (profRes.data?.success && profRes.data.data) {
          router.replace('/member/dashboard');
          return;
        }
      } catch {
        // Profile does not exist yet; proceed with onboarding
      }

      // Fetch pure specialization tags from backend
      try {
        setIsFetchingTags(true);
        const res = await specializationTagApi.getAll();
        if (isMounted && res.data?.success && res.data.data) {
          const tags = res.data.data;
          setSpecializations(tags);
          if (tags.length > 0) {
            setSelectedGoal(tags[0].id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Unable to load fitness specializations from server. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setIsFetchingTags(false);
        }
      }
    }

    checkExistingProfileAndFetchTags();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSaveGoal = async () => {
    if (!selectedGoal) {
      setError('Please select a fitness goal to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await memberApi.onboarding(selectedGoal);

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setIsSuccess(true);
        await refreshUser();
        setTimeout(() => {
          router.push('/member/dashboard');
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to save fitness goal');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to complete onboarding. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
            FITNESS<span className="text-orange-600">PRO</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span className="font-semibold">Member Onboarding</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="text-center mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" /> Required Step
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Your Fitness Goal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Please choose a goal to set up your member profile and access your member dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Member profile created! Taking you to your dashboard...
          </div>
        )}

        {/* Loading Skeletons */}
        {isFetchingTags ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-between"
              >
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : specializations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 my-6 bg-white dark:bg-slate-900">
            <Sparkles className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No fitness goals available
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Please contact administration or try again later.
            </p>
          </div>
        ) : (
          /* Pure Backend Data */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {specializations.map((tag) => {
              const isSelected = selectedGoal === tag.id;

              return (
                <div
                  key={tag.id}
                  onClick={() => setSelectedGoal(tag.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-sm ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tag.name}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Non-skippable Action Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            You must complete this step to access your dashboard.
          </p>

          <Button
            onClick={handleSaveGoal}
            isLoading={isLoading}
            disabled={isLoading || isSuccess || isFetchingTags || !selectedGoal}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 font-bold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Confirm & Continue'
            )}
          </Button>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="max-w-3xl w-full mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Signed in as{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {user?.fullName || user?.email || 'Member'}
          </strong>
        </span>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </div>
  );
}
