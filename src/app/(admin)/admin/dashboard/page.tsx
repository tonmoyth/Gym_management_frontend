'use strict';
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { 
  Building2, 
  Award, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  FileWarning, 
  TrendingUp, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // 1. Fetch Global Dashboard KPI metrics
  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  // 2. Fetch pending queues for instant action indicators
  const { data: pendingGymsRes } = useQuery({
    queryKey: ['admin-pending-gyms'],
    queryFn: () => adminApi.getPendingBusinesses(),
  });

  const { data: pendingCertsRes } = useQuery({
    queryKey: ['admin-pending-certs'],
    queryFn: () => adminApi.getPendingCertifications(),
  });

  const { data: openDisputesRes } = useQuery({
    queryKey: ['admin-open-disputes'],
    queryFn: () => adminApi.getDisputes({ status: 'OPEN' }),
  });

  const { data: flaggedReviewsRes } = useQuery({
    queryKey: ['admin-flagged-reviews'],
    queryFn: () => adminApi.getFlaggedReviews(),
  });

  const stats = dashboardRes?.data?.data;
  const pendingGymsCount = pendingGymsRes?.data?.data?.length || 0;
  const pendingCertsCount = pendingCertsRes?.data?.data?.length || 0;
  const openDisputesCount = openDisputesRes?.data?.data?.length || 0;
  const flaggedReviewsCount = flaggedReviewsRes?.data?.data?.length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
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
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Platform Command Center
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Super Admin Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          System-wide telemetry, gateway status, verification queues, and audit oversight.
        </p>
      </div>

      {/* Global Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Gyms</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.businesses?.total || 0}
          </p>
          <p className="text-xs text-emerald-400 mt-1">
            {stats?.businesses?.active || 0} Active Gym Centers
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Trainers</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.trainers?.total || 0}
          </p>
          <p className="text-xs text-teal-400 mt-1">
            {stats?.trainers?.active || 0} Active Coaches
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.members?.total || 0}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            {stats?.members?.active || 0} Subscribed Athletes
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {formatCurrency(stats?.revenue?.total || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Monthly: {formatCurrency(stats?.revenue?.monthly || 0)}
          </p>
        </div>
      </div>

      {/* Action Verification Queues */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Action Queues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/businesses" className="group">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pendingGymsCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pendingGymsCount} Pending
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  Gym Business Approvals
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  New gym registrations requiring verification of trade licenses and addresses.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Review Gyms</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/admin/certifications" className="group">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pendingCertsCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pendingCertsCount} Pending
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  Trainer Credentials Audit
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Certifications uploaded by trainers awaiting credential verification.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Verify Credentials</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/admin/disputes" className="group">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    openDisputesCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {openDisputesCount} Open
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  Dispute Arbitration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Payment grievances, refund appeals, and service quality escalations.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Arbitrate Disputes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/admin/moderation" className="group">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileWarning className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    flaggedReviewsCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {flaggedReviewsCount} Flagged
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  Content Moderation
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reported member reviews and flagged job postings requiring audit.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Moderate Content</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
