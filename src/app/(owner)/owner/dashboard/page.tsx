'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { businessApi, BusinessDashboardData } from '@/lib/api/business.api';
// Referral system temporarily disabled - will be implemented later
// import { referralApi } from '@/lib/api/referral.api';
import { Business } from '@/types/api.types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  Users,
  QrCode,
  DollarSign,
  Award,
  AlertCircle,
  Clock,
  Wrench,
  Star,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [dashboard, setDashboard] = useState<BusinessDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const myBizRes = await businessApi.getMyBusiness();
        if (myBizRes.data?.success && myBizRes.data.data) {
          let biz = myBizRes.data.data;
          /*
          // Referral system temporarily disabled - will be implemented later
          // Fallback to fetch or auto-generate referral code if missing
          if (!biz.referralCode) {
            try {
              const codeRes = await referralApi.getMyBusinessReferralCode();
              if (codeRes.data?.data?.referralCode) {
                biz = { ...biz, referralCode: codeRes.data.data.referralCode };
              }
            } catch {
              // fallback gracefully
            }
          }
          */
          setBusiness(biz);
          try {
            const dashRes = await businessApi.getDashboard(biz.id);
            if (dashRes.data?.success && dashRes.data.data) {
              setDashboard(dashRes.data.data);
            }
          } catch (dashErr) {
            console.error('Failed to load dashboard metrics:', dashErr);
          }
        } else {
          // No business created yet -> redirect to setup
          router.replace('/owner/setup');
        }
      } catch {
        router.replace('/owner/setup');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Referral system temporarily disabled - will be implemented later
  /*
  const handleCopyReferral = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!business?.referralCode) return;
    try {
      await navigator.clipboard.writeText(business.referralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = business.referralCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };
  */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!business) return null;

  const pendingBookings = dashboard?.pendingActions?.pendingBookingRequests || 0;
  const pendingTrainers = dashboard?.pendingActions?.pendingTrainerApplications || 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/25 px-3 py-1 rounded-full">
              Facility Management
            </span>
            <StatusBadge status={business.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-blue-100">
            <span className="opacity-90">{business.address}</span>
            {/* Referral system temporarily disabled - will be implemented later
            <span className="text-blue-300/60">·</span>
            <div
              onClick={() => business.referralCode && handleCopyReferral()}
              className={`inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 rounded-xl text-xs transition-all shadow-sm ${
                business.referralCode ? 'cursor-pointer group' : ''
              }`}
              title={business.referralCode ? 'Click to copy referral code' : undefined}
            >
              <span className="text-blue-200 font-medium">Referral Code:</span>
              <span className="font-mono font-bold tracking-wider text-emerald-300 select-all group-hover:text-emerald-200 transition-colors">
                {business.referralCode || 'N/A'}
              </span>
              {business.referralCode && (
                <button
                  type="button"
                  onClick={(e) => handleCopyReferral(e)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ml-1 ${
                    copiedReferral
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                  }`}
                  title="Copy Referral Code"
                >
                  {copiedReferral ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-100" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            */}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/owner/attendance">
            <Button
              variant="secondary"
              size="md"
              className="bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-2xl shadow-lg"
            >
              <QrCode className="w-4 h-4 mr-1.5 text-blue-600" />
              Check-in QR
            </Button>
          </Link>
          <Link href="/owner/plans">
            <Button
              variant="outline"
              size="md"
              className="border-white/40 text-white hover:bg-white/10 rounded-2xl font-bold"
            >
              Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Pending Approvals Banner */}
      {pendingBookings > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {pendingBookings} Membership Booking{pendingBookings > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-slate-500">
                Review payment receipts and confirm enrollments to grant facility access
              </p>
            </div>
          </div>
          <Link href="/owner/bookings">
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 gap-1 shrink-0"
            >
              Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {dashboard?.members?.activeMembers || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {dashboard?.members?.totalMembers || 0} total enrolled
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Today&apos;s Attendance</span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {dashboard?.attendance?.todayAttendance || 0}
          </div>
          <p className="text-[11px] text-slate-400">Members checked in today</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(dashboard?.revenue?.monthlyRevenue || 0)}
          </div>
          <p className="text-[11px] text-slate-400">
            Total: {formatCurrency(dashboard?.revenue?.totalRevenue || 0)}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Trainers</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {dashboard?.trainers?.activeTrainers || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {pendingTrainers > 0 ? `${pendingTrainers} applicants pending` : 'All slots filled'}
          </p>
        </div>
      </div>

      {/* Secondary Information & Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes & Schedule */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Classes Today</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {dashboard?.classes?.todayClasses || 0}
            </div>
            <p className="text-xs text-slate-500">
              {dashboard?.classes?.ongoingClasses || 0} ongoing session(s)
            </p>
          </div>
          <Link href="/owner/classes">
            <Button variant="outline" size="sm" className="w-full rounded-xl">
              Manage Timetable
            </Button>
          </Link>
        </div>

        {/* Equipment Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Equipment Inventory</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {dashboard?.equipment?.totalEquipment || 0} <span className="text-xs font-normal">items</span>
            </div>
            <p className="text-xs text-slate-500">
              {dashboard?.equipment?.maintenanceRequired || 0} item(s) require repair
            </p>
          </div>
          <Link href="/owner/equipment">
            <Button variant="outline" size="sm" className="w-full rounded-xl">
              View Equipment Log
            </Button>
          </Link>
        </div>

        {/* SaaS Subscription & Billing */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Platform Subscription</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={dashboard?.subscription?.subscriptionStatus || 'ACTIVE'} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Next billing date:{' '}
              {dashboard?.subscription?.nextBillingDate
                ? new Date(dashboard.subscription.nextBillingDate).toLocaleDateString()
                : 'Current Period Active'}
            </p>
          </div>
          <Link href="/owner/subscription">
            <Button variant="outline" size="sm" className="w-full rounded-xl">
              Subscription Billing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
