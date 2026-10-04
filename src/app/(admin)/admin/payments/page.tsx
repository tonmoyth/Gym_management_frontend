'use strict';
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  CreditCard, 
  CheckCircle2, 
  Activity, 
  Clock, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import { Payment } from '@/types/api.types';

export default function AdminPaymentsPage() {
  // 1. Fetch Gateway Health Status
  const { data: gatewayRes, isLoading: isGatewaysLoading } = useQuery({
    queryKey: ['admin-gateway-status'],
    queryFn: () => adminApi.getGatewayStatus(),
  });

  // 2. Fetch platform transactions
  const { data: txRes, isLoading: isTxLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => adminApi.getTransactions(),
  });

  const transactions = txRes?.data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Payment Gateways & Transactions</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Monitor multi-gateway uptime (bKash, Nagad, Rocket, Stripe) and audit live subscription payments.
        </p>
      </div>

      {/* Gateways Health Status */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Payment Processors Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'bKash Merchant PGW', type: 'MFS Direct', ping: '110ms', uptime: '99.98%', color: 'from-pink-500/10' },
            { name: 'Nagad Gateway API', type: 'MFS Direct', ping: '135ms', uptime: '99.92%', color: 'from-amber-500/10' },
            { name: 'Rocket DBBL API', type: 'MFS Gateway', ping: '145ms', uptime: '99.85%', color: 'from-purple-500/10' },
            { name: 'Stripe International', type: 'Credit / Debit Cards', ping: '85ms', uptime: '100%', color: 'from-blue-500/10' },
          ].map((gw, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-b ${gw.color} to-slate-900 border border-slate-800 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{gw.type}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operational
                </span>
              </div>
              <h3 className="font-bold text-white text-base">{gw.name}</h3>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                <span>Latency: <strong className="text-slate-200">{gw.ping}</strong></span>
                <span>Uptime: <strong className="text-emerald-400">{gw.uptime}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Platform Transaction Ledger</h2>

        {isTxLoading ? (
          <TableSkeleton rows={6} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Transactions Logged"
            description="Member plan bookings and SaaS subscription checkouts will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Customer / Member</th>
                    <th className="py-4 px-6">Gateway</th>
                    <th className="py-4 px-6">Amount (BDT)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {transactions.map((tx: Payment) => {
                    const userName = (tx as any).user?.fullName || (tx as any).membership?.member?.user?.fullName || 'Customer';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-purple-300 font-bold">
                          {tx.transactionId || tx.id.slice(0, 14)}
                        </td>
                        <td className="py-4 px-6 text-white font-semibold">
                          {userName}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 uppercase">
                            {tx.gateway}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-4 px-6 text-right text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
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
