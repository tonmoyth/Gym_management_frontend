'use strict';
'use client';

import React from 'react';
import { Gift, Info } from 'lucide-react';

export default function OwnerReferralSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Member Referral Program</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Reward system for gym members and facility referrals.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Gift className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Referral System Temporarily Disabled</h2>
          <p className="text-sm text-slate-400">
            The referral system is currently paused and will be implemented in a future update. All configuration options and reward tracking will be available once launched.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Implementation scheduled for a later release</span>
        </div>
      </div>
    </div>
  );
}

/*
// =========================================================================
// ORIGINAL REFERRAL IMPLEMENTATION (Commented out for future implementation)
// =========================================================================

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { referralApi } from '@/lib/api/referral.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Gift, 
  Settings, 
  Check, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
} from 'lucide-react';
import { MemberReferral, MemberReferralSetting } from '@/types/api.types';

export function OriginalOwnerReferralSettingsPage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedGymCode, setCopiedGymCode] = useState(false);

  // Settings form state
  const [commissionAmount, setCommissionAmount] = useState('200');
  const [referralDiscount, setReferralDiscount] = useState('100');
  const [isEnabled, setIsEnabled] = useState(true);

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  const handleCopyGymCode = () => {
    if (!business?.referralCode) return;
    navigator.clipboard.writeText(business.referralCode);
    setCopiedGymCode(true);
    setTimeout(() => setCopiedGymCode(false), 2000);
  };

  // 2. Fetch referral settings
  const { data: settingsRes, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['referral-settings', businessId],
    queryFn: () => referralApi.getReferralSettings(businessId!),
    enabled: !!businessId,
  });

  const settings = settingsRes?.data?.data;

  useEffect(() => {
    if (settings) {
      setCommissionAmount(settings.commissionAmount?.toString() || '200');
      setReferralDiscount((settings as any).referralDiscount?.toString() || '100');
      setIsEnabled(settings.isEnabled !== false);
    }
  }, [settings]);

  // 3. Fetch referrals list for this gym
  const { data: referralsRes, isLoading: isReferralsLoading } = useQuery({
    queryKey: ['owner-member-referrals'],
    queryFn: () => referralApi.getOwnerMemberReferrals(),
  });

  const referrals = referralsRes?.data?.data || [];

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      referralApi.setReferralSettings(businessId!, {
        commissionAmount: parseFloat(commissionAmount),
        referralDiscount: parseFloat(referralDiscount),
        isEnabled,
      }),
    onSuccess: () => {
      setSuccessMessage('Referral rewards updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['referral-settings', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update referral configuration.');
    }
  });

  // Credit Reward Mutation
  const creditMutation = useMutation({
    mutationFn: (referralId: string) => referralApi.creditMemberReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-member-referrals'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to credit referral reward.');
    }
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    updateMutation.mutate();
  };

  if (isBusinessLoading || isSettingsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <CardSkeleton />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Member Referral Program</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Incentivize existing gym members with cash or wallet rewards when their invited friends join your gym.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
              Platform Referral Bonus
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Your Gym Referral Code</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Share this unique code with fellow gym owners when they sign up. You will receive a ৳500 platform commission credit when their facility is verified and approved.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl shadow-inner">
            <span className="text-xs text-slate-400">Code:</span>
            <span className="font-mono text-base font-black tracking-wider text-emerald-400">
              {business?.referralCode || 'N/A'}
            </span>
            {business?.referralCode && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyGymCode}
                className="ml-2 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                {copiedGymCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Program Configuration</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isEnabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="isEnabled" className="text-sm font-semibold text-white cursor-pointer">
              Enable Member-to-Member Referral Rewards for {business?.name}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Reward Amount to Referrer (BDT ৳) *"
              type="number"
              min="0"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              placeholder="200"
              helperText="Credited to the referring member once the new member's booking is approved."
              required
            />

            <Input
              label="Discount for New Joiner (BDT ৳) *"
              type="number"
              min="0"
              value={referralDiscount}
              onChange={(e) => setReferralDiscount(e.target.value)}
              placeholder="100"
              helperText="Instant discount applied at checkout when using a referral code."
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMutation.isPending}
            >
              Save Referral Rules
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Referral Ledger & Disbursals</h2>
          <span className="text-xs text-slate-400">{referrals.length} referrals recorded</span>
        </div>

        {isReferralsLoading ? (
          <TableSkeleton rows={4} />
        ) : referrals.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No Referrals Yet"
            description="When members share their unique referral code with friends to join your gym, referral logs will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Referrer Member</th>
                    <th className="py-4 px-6">Referred Friend</th>
                    <th className="py-4 px-6">Reward Amount</th>
                    <th className="py-4 px-6">Reward Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {referrals.map((ref: MemberReferral) => {
                    const isPending = ref.status === 'PENDING';
                    const referrerName = (ref as any).referrer?.user?.fullName || 'Member';
                    const refereeName = (ref as any).referred?.user?.fullName || 'New Member';

                    return (
                      <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {referrerName}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {refereeName}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                          {formatCurrency((ref as any).commissionAmount || 200)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={ref.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isPending && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => creditMutation.mutate(ref.id)}
                              isLoading={creditMutation.isPending}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="text-xs"
                            >
                              Credit Member
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
*/
