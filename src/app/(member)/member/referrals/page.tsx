'use client';

import React from 'react';
import { Gift, Info } from 'lucide-react';

export default function MemberReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Refer & Earn Rewards
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Invite friends and earn workout credits and membership rewards
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Gift className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Referral System Temporarily Disabled</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The member referral program is currently paused and will be launched in an upcoming update. Soon, you will be able to share referral links, invite workout partners, and earn credits!
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-blue-500" />
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
import { referralApi } from '@/lib/api/referral.api';
import { MemberReferral } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Gift, Copy, Check, Users, Sparkles } from 'lucide-react';

export function OriginalMemberReferralsPage() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<MemberReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReferralData() {
      setIsLoading(true);
      try {
        const [codeRes, listRes] = await Promise.allSettled([
          referralApi.getMyCode(),
          referralApi.getMyReferrals(),
        ]);

        if (codeRes.status === 'fulfilled' && codeRes.value.data?.success) {
          setReferralCode(codeRes.value.data.data?.referralCode || '');
        }
        if (listRes.status === 'fulfilled' && listRes.value.data?.success) {
          setReferrals(listRes.value.data.data || []);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadReferralData();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns: Column<MemberReferral>[] = [
    {
      header: 'Referred Member',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            {row.referredUser?.fullName || 'New Member'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {row.referredUser?.email || row.referredUserId}
          </p>
        </div>
      ),
    },
    {
      header: 'Gym Facility',
      cell: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.business?.name || 'Partner Gym'}
        </span>
      ),
    },
    {
      header: 'Commission / Discount',
      cell: (row) => (
        <span className="font-black text-emerald-600">
          {formatCurrency(row.commissionAmount)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date Joined',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Refer & Earn Rewards
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your referral code with friends and receive reward credits when they join partner gyms
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Member Referral Program
          </div>
          <h2 className="text-2xl font-black">Your Unique Referral Code</h2>
          <p className="text-xs text-orange-100 max-w-md">
            Give this code to friends when they sign up or book their first fitness plan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <span className="px-4 text-xl font-black tracking-widest font-mono text-white">
            {referralCode || 'LOADING...'}
          </span>
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="sm"
            className="bg-white text-slate-900 hover:bg-orange-50 rounded-xl"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" /> Referred Members History
        </h3>

        <DataTable
          columns={columns}
          data={referrals}
          isLoading={isLoading}
          emptyTitle="No Referrals Yet"
          emptyDescription="Share your referral code with gym buddies to start earning membership rewards."
        />
      </div>
    </div>
  );
}
*/
