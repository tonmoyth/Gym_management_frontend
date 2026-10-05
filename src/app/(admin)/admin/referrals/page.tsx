'use strict';
'use client';

import { Gift, Info } from 'lucide-react';

export default function AdminReferralsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Type-A B2B Referral Program</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Audit gym-to-gym referral commissions and disburse platform acquisition rewards.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Gift className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Referral System Temporarily Disabled</h2>
          <p className="text-sm text-slate-400">
            The B2B and platform referral audit features are temporarily paused and will be implemented in a future update.
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

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Gift, Building2, CheckCircle2 } from 'lucide-react';
import { BusinessReferral } from '@/types/api.types';

export function OriginalAdminReferralsPage() {
  const queryClient = useQueryClient();

  const { data: referralsRes, isLoading } = useQuery({
    queryKey: ['admin-business-referrals'],
    queryFn: () => adminApi.getTypeAReferrals(),
  });

  const referrals = referralsRes?.data?.data || [];

  // Credit Mutation
  const creditMutation = useMutation({
    mutationFn: (id: string) => adminApi.creditTypeAReferral(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-business-referrals'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Type-A B2B Referral Program</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Audit gym-to-gym referral commissions and disburse platform acquisition rewards.
        </p>
      </div>

      {referrals.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No B2B Referrals Logged"
          description="When gym owners invite partner facilities to launch on the SaaS platform, referral rewards will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Referring Gym</th>
                  <th className="py-4 px-6">Referred Gym</th>
                  <th className="py-4 px-6">Commission (BDT)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {referrals.map((r: BusinessReferral) => {
                  const isPending = r.status === 'PENDING';
                  const referringGym = (r as any).referrer?.name || 'Partner Gym';
                  const referredGym = (r as any).referred?.name || 'New Gym Center';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{referringGym}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {referredGym}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                        {formatCurrency((r as any).commissionAmount || 1000)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => creditMutation.mutate(r.id)}
                            isLoading={creditMutation.isPending}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Credit Reward
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
  );
}
*/
