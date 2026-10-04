'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi, TrainerDashboardData } from '@/lib/api/trainer.api';
import { payoutApi } from '@/lib/api/payout.api';
import { notificationApi } from '@/lib/api/notification.api';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import {
  Award,
  CheckCircle2,
  Calendar,
  Users,
  Star,
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Building2,
  Bell,
  CheckCheck,
  Check,
  Activity,
  Flame,
  UserCheck,
  UserX,
  ChevronRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { TrainerPayout, Notification } from '@/types/api.types';

export default function TrainerDashboardPage() {
  const queryClient = useQueryClient();

  // 1. Fetch own trainer profile
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const profile = profileRes?.data?.data;

  // 2. Fetch payouts
  const { data: payoutsRes } = useQuery({
    queryKey: ['trainer-payouts-me'],
    queryFn: () => payoutApi.getMyPayouts(),
  });

  const rawPayouts = payoutsRes?.data?.data;
  const payouts: TrainerPayout[] = Array.isArray(rawPayouts)
    ? rawPayouts
    : Array.isArray((rawPayouts as any)?.data)
      ? (rawPayouts as any).data
      : [];
  const latestPayout = payouts[0];

  // 3. State for selected business context
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  // Extract businesses list
  const affiliatedBusinesses = Array.isArray(profile?.businesses)
    ? profile.businesses.map((b: any) => ({
        id: b.business?.id || b.businessId || b.id,
        name: b.business?.name || 'Affiliated Gym',
        logo: b.business?.logo || null,
        joinedAt: b.joinedAt,
      }))
    : [];

  // Automatically select first business if none selected
  useEffect(() => {
    if (!selectedBusinessId && affiliatedBusinesses.length > 0) {
      setSelectedBusinessId(affiliatedBusinesses[0].id);
    }
  }, [affiliatedBusinesses, selectedBusinessId]);

  // 4. Fetch Business-scoped dashboard
  const {
    data: businessDashRes,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ['trainer-business-dashboard', selectedBusinessId],
    queryFn: () => trainerApi.getBusinessDashboard(selectedBusinessId),
    enabled: !!selectedBusinessId,
  });

  const businessData: TrainerDashboardData | undefined = businessDashRes?.data?.data;

  // 5. Fetch Notifications
  const { data: notificationsRes, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ['trainer-notifications'],
    queryFn: () => notificationApi.getMyNotifications({ limit: 6 }),
  });

  const rawNotifications = notificationsRes?.data?.data;
  const notifications: Notification[] = Array.isArray(rawNotifications)
    ? rawNotifications
    : Array.isArray((rawNotifications as any)?.data)
      ? (rawNotifications as any).data
      : [];

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Notification mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-notifications'] });
    },
  });

  // Time formatter helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (isProfileLoading) {
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

  const completionPercent = profile?.profileCompletionPercent || 50;
  const isVerified = profile?.verifiedBadge || false;

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Fitness Coach
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Badge
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white">
              Welcome back, Coach {profile?.user?.fullName || 'Trainer'}!
            </h1>
            <p className="text-slate-400 mt-1 text-sm max-w-xl">
              Track client assignments, manage nutrition diet charts, log body composition progress, and oversee daily gym class sessions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/trainer/job-posts">
              <Button variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>
                Browse Gym Jobs
              </Button>
            </Link>
            <Link href="/trainer/certifications">
              <Button variant="outline" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Upload Credentials
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Warning if < 100% */}
        {completionPercent < 100 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                Your profile is currently <strong>{completionPercent}%</strong> complete. The platform requires <strong>100%</strong> completion and at least 1 verified certification before you can apply to gym job vacancies.
              </span>
            </div>
            <Link href="/trainer/profile" className="shrink-0">
              <Button size="sm" variant="outline" className="text-xs text-amber-300 border-amber-500/30">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 2. Top Overview KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {profile?.avgRating ? Number(profile.avgRating).toFixed(1) : '5.0'}
          </p>
          <p className="text-xs text-slate-500 mt-1">From verified member reviews</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Completion</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-400 mt-3">
            {completionPercent}%
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last Payout</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {latestPayout ? formatCurrency(latestPayout.amount) : '৳ 0'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {latestPayout ? `Status: ${latestPayout.status}` : 'No payouts logged yet'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certifications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-400 mt-3">
            {profile?.certifications?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Credentials uploaded</p>
        </div>
      </div>

      {/* 3. Business-Scoped Dashboard Section */}
      <div className="space-y-6 pt-2">
        {/* Section Header with Facility Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-bold text-white">
                Business-Scoped Operations
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live schedule, assigned members, attendance records, and monthly statistics for your assigned facility.
            </p>
          </div>

          {/* Facility Selector */}
          {affiliatedBusinesses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Facility:</span>
              <select
                id="facility-selector"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer"
              >
                {affiliatedBusinesses.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* If trainer has NO affiliated gym yet */}
        {affiliatedBusinesses.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">No Gym Affiliations Yet</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                You are not currently linked with any active fitness facility. Once a gym hires you through job applications or adds you directly, your business-specific schedule, assigned members, attendance metrics, and stats will automatically appear here.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/trainer/job-posts">
                <Button size="sm" variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>
                  Explore Gym Job Openings
                </Button>
              </Link>
              <Link href="/trainer/profile">
                <Button size="sm" variant="outline">
                  Update Trainer Profile
                </Button>
              </Link>
            </div>
          </div>
        ) : isBusinessLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 animate-pulse h-80" />
              <div className="lg:col-span-5 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 animate-pulse h-80" />
            </div>
          </div>
        ) : businessError ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              Unable to load facility dashboard for this business. Please ensure your account has active trainer access to this facility.
            </span>
          </div>
        ) : businessData ? (
          <div className="space-y-6">
            {/* Business KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Today's Attendance */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Today's Attendance
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-400">
                      {businessData.todayAttendance?.attendanceRate || 0}%
                    </span>
                    <span className="text-xs text-slate-400">rate today</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {businessData.todayAttendance?.checkedIn || 0} checked in
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      {businessData.todayAttendance?.absent || 0} absent
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Assigned Members */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Assigned Members
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {businessData.assignedMembers?.totalAssignedMembers || 0}
                    </span>
                    <span className="text-xs text-slate-400">total clients</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="text-blue-400">
                      {businessData.assignedMembers?.activeMembers || 0} active
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      {businessData.assignedMembers?.inactiveMembers || 0} inactive
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Classes This Month */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Classes This Month
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {businessData.monthlyStatistics?.classesThisMonth || 0}
                    </span>
                    <span className="text-xs text-slate-400">scheduled</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="text-emerald-400">
                      {businessData.monthlyStatistics?.completedClasses || 0} completed
                    </span>
                    <span>•</span>
                    <span className="text-rose-400">
                      {businessData.monthlyStatistics?.cancelledClasses || 0} cancelled
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Facility Rating & Reviews */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Facility Performance
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-400">
                      {businessData.quickStatistics?.averageMemberRating
                        ? Number(businessData.quickStatistics.averageMemberRating).toFixed(1)
                        : '5.0'}
                    </span>
                    <span className="text-xs text-slate-400">★ average rating</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {businessData.quickStatistics?.totalReviews || 0} member reviews • {businessData.quickStatistics?.averageAttendanceRate || 0}% avg attendance
                  </p>
                </div>
              </div>
            </div>

            {/* Main Operations Grid: Left (Schedule & Activities) vs Right (Notifications & Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Today's Schedule + Upcoming Classes + Attendance Feed (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Today's Schedule Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Today's Class Schedule</h3>
                        <p className="text-xs text-slate-400">Scheduled sessions for {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-teal-400">
                      {businessData.todaySchedule?.length || 0} sessions
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {businessData.todaySchedule && businessData.todaySchedule.length > 0 ? (
                      businessData.todaySchedule.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {session.className}
                              </span>
                              <StatusBadge status={session.status} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-teal-400 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <Users className="w-3.5 h-3.5" />
                                {session.totalBookedMembers} booked
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">
                              {session.status === 'COMPLETED' ? 'Completed' : 'Ready'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No classes scheduled for today</p>
                        <p className="text-xs text-slate-500 mt-1">Enjoy your rest day or check upcoming upcoming sessions below.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Classes Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Upcoming Classes</h3>
                        <p className="text-xs text-slate-400">Next sessions on your calendar</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {businessData.upcomingClasses && businessData.upcomingClasses.length > 0 ? (
                      businessData.upcomingClasses.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-white text-sm">{item.className}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatDate(item.startTime)} at {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                              <Users className="w-3 h-3" />
                              {item.totalBookedMembers} members
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No upcoming sessions found for this business.
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Member Attendance Feed */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Live Attendance Check-Ins</h3>
                        <p className="text-xs text-slate-400">Recent member visits and attendance logs</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {businessData.recentMemberActivities && businessData.recentMemberActivities.length > 0 ? (
                      businessData.recentMemberActivities.map((act, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                              ✓
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{act.memberName}</p>
                              <p className="text-[11px] text-emerald-400">{act.activity}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {formatDate(act.time)} {formatTime(act.time)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No recent member attendance logged yet today.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Notifications Feed + Assigned Member Breakdown + Monthly Stats (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Notifications Panel (GET /notifications) */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center relative">
                        <Bell className="w-4 h-4" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">Alerts & Notifications</h3>
                          {unreadNotificationsCount > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {unreadNotificationsCount} new
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">Platform and gym announcements</p>
                      </div>
                    </div>

                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={markAllReadMutation.isPending}
                        className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {isNotificationsLoading ? (
                      <div className="space-y-2">
                        <div className="h-14 bg-slate-950/60 rounded-xl animate-pulse" />
                        <div className="h-14 bg-slate-950/60 rounded-xl animate-pulse" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No notifications at this time.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            !n.isRead
                              ? 'bg-teal-950/20 border-teal-500/30'
                              : 'bg-slate-950/40 border-slate-800/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <StatusBadge status={n.type} className="text-[10px] py-0 px-2" />
                                <span className="text-xs font-bold text-white">{n.title}</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{n.body}</p>
                              <span className="text-[10px] text-slate-500 block pt-1">
                                {formatDate(n.createdAt)} at {formatTime(n.createdAt)}
                              </span>
                            </div>

                            {!n.isRead && (
                              <button
                                onClick={() => markAsReadMutation.mutate(n.id)}
                                title="Mark as read"
                                className="p-1 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Assigned Members Breakdown Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <h3 className="font-bold text-white text-sm">Assigned Members Breakdown</h3>
                    </div>
                    <Link
                      href="/trainer/diet-plans"
                      className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Diet Plans <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Active Members
                      </span>
                      <span className="font-bold text-emerald-400">
                        {businessData.assignedMembers?.activeMembers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <UserX className="w-3.5 h-3.5 text-slate-500" /> Inactive Members
                      </span>
                      <span className="font-bold text-slate-400">
                        {businessData.assignedMembers?.inactiveMembers || 0}
                      </span>
                    </div>

                    {/* Progress Bar of Active Ratio */}
                    {businessData.assignedMembers?.totalAssignedMembers > 0 && (
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-400 h-full transition-all"
                          style={{
                            width: `${Math.round(
                              ((businessData.assignedMembers.activeMembers || 0) /
                                (businessData.assignedMembers.totalAssignedMembers || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Link href="/trainer/progress" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Log Member Progress
                      </Button>
                    </Link>
                    <Link href="/trainer/diet-plans" className="flex-1">
                      <Button size="sm" variant="primary" className="w-full text-xs">
                        Assign Diet
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 3. Monthly Statistics Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <h3 className="font-bold text-white text-sm">Monthly Operational Summary</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">New Clients</span>
                      <span className="text-lg font-black text-white mt-1 block">
                        +{businessData.monthlyStatistics?.newMembersThisMonth || 0}
                      </span>
                      <span className="text-[10px] text-teal-400">this month</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Avg Attendance</span>
                      <span className="text-lg font-black text-white mt-1 block">
                        {businessData.quickStatistics?.averageAttendanceRate || 0}%
                      </span>
                      <span className="text-[10px] text-emerald-400">facility rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 4. Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Explore Gym Hiring</h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse vacancies posted by registered fitness centers seeking certified trainers.
            </p>
          </div>
          <Link href="/trainer/job-posts" className="mt-4">
            <Button size="sm" variant="outline" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Find Jobs
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Client Progress & Diet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prescribe nutrition plans and record body measurements (weight, chest, waist, BMI) for members.
            </p>
          </div>
          <Link href="/trainer/progress" className="mt-4">
            <Button size="sm" variant="outline" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Log Metrics
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Client Reviews</h3>
            <p className="text-xs text-slate-400 mt-1">
              Read testimonials and feedback left by members after training sessions.
            </p>
          </div>
          <Link href="/trainer/reviews" className="mt-4">
            <Button size="sm" variant="outline" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Read Reviews
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
