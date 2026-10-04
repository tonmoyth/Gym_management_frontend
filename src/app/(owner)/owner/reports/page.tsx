'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { reportApi, RevenueReportParams } from '@/lib/api/report.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { CardSkeleton, TableSkeleton } from '@/components/ui/EmptyState';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Wallet,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OwnerReportsPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'payouts'>('revenue');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all' | 'custom'>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // Build query params
  const revenueParams: RevenueReportParams = {
    period: period === 'custom' ? undefined : period,
    dateFrom: period === 'custom' && dateFrom ? dateFrom : undefined,
    dateTo: period === 'custom' && dateTo ? dateTo : undefined,
  };

  // 2. Fetch Revenue Report
  const { 
    data: revenueRes, 
    isLoading: isRevenueLoading,
    refetch: refetchRevenue 
  } = useQuery({
    queryKey: ['revenue-report', businessId, period, dateFrom, dateTo],
    queryFn: () => reportApi.getRevenueReport(businessId!, revenueParams),
    enabled: !!businessId && activeTab === 'revenue',
  });

  // 3. Fetch Payouts Report
  const { 
    data: payoutsRes, 
    isLoading: isPayoutsLoading,
    refetch: refetchPayouts 
  } = useQuery({
    queryKey: ['payouts-report', businessId, payoutStatusFilter, dateFrom, dateTo],
    queryFn: () => reportApi.getPayoutReport(businessId!, {
      status: payoutStatusFilter === 'ALL' ? undefined : payoutStatusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: !!businessId && activeTab === 'payouts',
  });

  const revenueData = revenueRes?.data?.data;
  const payoutsData = payoutsRes?.data?.data;

  // Normalized summary data
  const revenueSummary = revenueData?.summary || {
    totalRevenue: revenueData?.totalRevenue ?? revenueData?.total ?? 0,
    totalMemberships: revenueData?.totalTransactions ?? revenueData?.count ?? 0,
    averageMembershipValue: revenueData?.averageTicket ?? 0,
    growthPercentage: 0,
  };

  const chartData = revenueData?.chart || [];
  const topPlans = revenueData?.topPlans || [];
  const gatewayBreakdown = revenueData?.gatewayBreakdown || [];
  const recentTransactions = revenueData?.recentTransactions || [];

  const payoutSummary = payoutsData?.summary || {
    totalPaid: payoutsData?.totalPaid ?? payoutsData?.totalAmount ?? 0,
    pendingAmount: payoutsData?.pendingAmount ?? 0,
    failedAmount: 0,
    totalPayouts: payoutsData?.payouts?.length ?? 0,
  };

  const payoutList = payoutsData?.payouts || [];

  // Max revenue for bar chart scaling
  const maxChartVal = chartData.length > 0 
    ? Math.max(...chartData.map(c => Number(c.revenue) || 0), 1) 
    : 1;

  if (isBusinessLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
              Financial Analytics
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {business?.name || 'Facility'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Financial & Performance Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Audited financial breakdown of membership subscriptions, payment gateways, and coach compensation.
          </p>
        </div>

        {/* Quick Period Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            {(
              [
                { key: 'month', label: 'This Month' },
                { key: 'quarter', label: 'This Quarter' },
                { key: 'year', label: 'This Year' },
                { key: 'all', label: 'All Time' },
                { key: 'custom', label: 'Custom' },
              ] as const
            ).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  period === p.key
                    ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (activeTab === 'revenue' ? refetchRevenue() : refetchPayouts())}
            className="rounded-xl"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRevenueLoading || isPayoutsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker (shown when period === 'custom') */}
      {period === 'custom' && (
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'revenue'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Membership Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'payouts'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Trainer Payouts</span>
        </button>
      </div>

      {/* Revenue Content */}
      {activeTab === 'revenue' && (
        <div className="space-y-8">
          {isRevenueLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
              <TableSkeleton rows={4} />
            </div>
          ) : (
            <>
              {/* Primary KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Period Revenue</p>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {formatCurrency(revenueSummary.totalRevenue)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {revenueSummary.growthPercentage >= 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{revenueSummary.growthPercentage}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {revenueSummary.growthPercentage}%
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">vs previous period</span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</p>
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {revenueSummary.totalMemberships}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Verified member subscription payments
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Plan Value</p>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {formatCurrency(revenueSummary.averageMembershipValue)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    Revenue realized per booking transaction
                  </p>
                </div>
              </div>

              {/* Revenue Trend Visual Bar Chart */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Timeline Trend</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Chronological distribution of revenue collections for the selected timeframe.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl w-fit">
                    Total: {formatCurrency(revenueSummary.totalRevenue)}
                  </span>
                </div>

                {chartData.length > 0 ? (
                  <div className="pt-8 pb-4">
                    <div className="flex items-end gap-3 sm:gap-6 h-48 sm:h-56 px-2 border-b border-slate-200 dark:border-slate-800">
                      {chartData.map((item, idx) => {
                        const pct = Math.max(Math.round(((Number(item.revenue) || 0) / maxChartVal) * 100), 4);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                            {/* Value label */}
                            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                              {formatCurrency(item.revenue)}
                            </span>
                            {/* Bar */}
                            <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end h-full">
                              <div
                                style={{ height: `${pct}%` }}
                                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all rounded-t-xl shadow-md shadow-blue-500/10"
                              />
                            </div>
                            {/* Label */}
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <span>No transaction trends recorded for this specific date range.</span>
                  </div>
                )}
              </div>

              {/* Two Column Grid: Plans & Gateways */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Membership Plans Breakdown */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Plan Performance Breakdown</h3>
                    <span className="text-xs text-slate-400">{topPlans.length} plans</span>
                  </div>

                  {topPlans.length > 0 ? (
                    <div className="space-y-4">
                      {topPlans.map((plan, idx) => {
                        const share = revenueSummary.totalRevenue > 0 
                          ? Math.round((plan.revenue / revenueSummary.totalRevenue) * 100) 
                          : 0;
                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.planName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{plan.totalSales} membership booking{plan.totalSales > 1 ? 's' : ''}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                  {formatCurrency(plan.revenue)}
                                </span>
                                <p className="text-[10px] text-slate-400">{share}% share</p>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No membership plan sales recorded for this period.
                    </div>
                  )}
                </div>

                {/* Gateway & Payment Method Distribution */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Gateway Channels</h3>
                    <span className="text-xs text-slate-400">{gatewayBreakdown.length} gateways</span>
                  </div>

                  {gatewayBreakdown.length > 0 ? (
                    <div className="space-y-4">
                      {gatewayBreakdown.map((gw, idx) => {
                        const share = revenueSummary.totalRevenue > 0 
                          ? Math.round((gw.amount / revenueSummary.totalRevenue) * 100) 
                          : 0;
                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                  {gw.gateway.substring(0, 2)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-sm">{gw.gateway}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{gw.count} payment{gw.count > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                  {formatCurrency(gw.amount)}
                                </span>
                                <p className="text-[10px] text-slate-400">{share}% share</p>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No gateway payment transactions recorded for this period.
                    </div>
                  )}
                </div>
              </div>

              {/* Audited Transactions Table */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Audited Payment Records</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Verified member transactions recorded for this gym facility.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {recentTransactions.length} transaction{recentTransactions.length === 1 ? '' : 's'}
                  </span>
                </div>

                {recentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Member / Payer</th>
                          <th className="py-3 px-4">Membership Plan</th>
                          <th className="py-3 px-4">Gateway</th>
                          <th className="py-3 px-4">Transaction ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              <div>
                                <p>{tx.payer?.name || 'Member'}</p>
                                <p className="text-[11px] text-slate-400 font-normal">{tx.payer?.email}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              {tx.planName}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {tx.gateway}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>{tx.transactionId}</span>
                                <button
                                  onClick={() => handleCopy(tx.transactionId)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                  title="Copy Transaction ID"
                                >
                                  {copiedRef === tx.transactionId ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {new Date(tx.createdAt).toLocaleDateString('default', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(tx.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No transaction records found for the selected period.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Payouts Content */}
      {activeTab === 'payouts' && (
        <div className="space-y-8">
          {isPayoutsLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
              <TableSkeleton rows={4} />
            </div>
          ) : (
            <>
              {/* Payouts KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Disbursed Payouts</p>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {formatCurrency(payoutSummary.totalPaid)}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">Successfully transferred to trainers</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</p>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">
                    {formatCurrency(payoutSummary.pendingAmount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">Awaiting payment disbursement</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payouts Logged</p>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                    {payoutSummary.totalPayouts}
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/owner/payouts"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Manage Trainer Payouts <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Status Filter & Payouts Table */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Coach Compensation Logs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disbursed and pending trainer commissions for your facility.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['ALL', 'PAID', 'PENDING'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setPayoutStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          payoutStatusFilter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {payoutList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Trainer</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Reference</th>
                          <th className="py-3 px-4">Payout Date</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payoutList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                {item.trainer?.profilePhoto ? (
                                  <img
                                    src={item.trainer.profilePhoto}
                                    alt={item.trainer.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-xs">
                                    {(item.trainer?.name || 'T')[0]}
                                  </div>
                                )}
                                <div>
                                  <p>{item.trainer?.name || 'Coach'}</p>
                                  <p className="text-[11px] text-slate-400 font-normal">{item.trainer?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                  item.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>{item.reference}</span>
                                <button
                                  onClick={() => handleCopy(item.reference)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                  title="Copy Reference"
                                >
                                  {copiedRef === item.reference ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {item.paymentDate
                                ? new Date(item.paymentDate).toLocaleDateString('default', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Pending'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No trainer payout records found for the selected timeframe.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
