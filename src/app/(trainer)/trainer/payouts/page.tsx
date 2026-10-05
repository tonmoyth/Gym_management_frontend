'use strict';
'use client';

import { useQuery } from '@tanstack/react-query';
import { payoutApi } from '@/lib/api/payout.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { DollarSign, Building2 } from 'lucide-react';
import { TrainerPayout } from '@/types/api.types';

export default function TrainerPayoutsPage() {
  const { data: payoutsRes, isLoading } = useQuery({
    queryKey: ['trainer-payouts-me'],
    queryFn: () => payoutApi.getMyPayouts(),
  });

  const rawData = payoutsRes?.data?.data;
  const payouts: TrainerPayout[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.data)
    ? (rawData as any).data
    : [];

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
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Trainer Earnings & Payouts</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Track monthly compensation and salary disbursements transferred from affiliated gym centers.
        </p>
      </div>

      {payouts.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No Payouts Recorded"
          description="Your monthly retainer and coaching compensation will appear here once disbursed by your gym employer."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Billing Month</th>
                  <th className="py-4 px-6">Affiliated Gym</th>
                  <th className="py-4 px-6">Amount (BDT)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Transaction Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {payouts.map((p: TrainerPayout) => {
                  const gymName = (p as any).business?.name || 'Partner Gym';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        {p.month}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{gymName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {(p as any).transactionReference || '—'}
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
