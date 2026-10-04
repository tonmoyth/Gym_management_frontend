'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, MyAttendanceData } from '@/lib/api/attendance.api';
import { membershipApi } from '@/lib/api/membership.api';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import {
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  LogOut,
  LogIn,
  Building2,
  Trophy,
  Dumbbell,
  Sparkles,
  RefreshCw,
  Camera,
  Search,
  Check,
  Smartphone,
  Fingerprint,
} from 'lucide-react';
import { Membership } from '@/types/api.types';

export default function MemberAttendancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'quick' | 'scanner' | 'history'>('quick');
  const [manualGymId, setManualGymId] = useState('');
  const [manualMode, setManualMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // 1. Fetch Member Attendance Summary & History
  const {
    data: attendanceRes,
    isLoading: isAttendanceLoading,
    isFetching: isAttendanceFetching,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['member-attendance-me'],
    queryFn: () => attendanceApi.getMyAttendance(),
  });

  const attendanceData = attendanceRes?.data?.data;
  const summary = attendanceData?.summary || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
  const history = attendanceData?.history || [];

  // 2. Fetch Member's Active Memberships (Enrolled Gyms)
  const { data: membershipsRes, isLoading: isMembershipsLoading } = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => membershipApi.getMyMemberships(),
  });

  const allMemberships: Membership[] = membershipsRes?.data?.data || [];
  const activeMemberships = allMemberships.filter((m) => m.status === 'ACTIVE');

  // Determine current active check-in session for today
  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todaySession = useMemo(() => {
    return history.find((h) => {
      const logDate = h.date ? h.date.split('T')[0] : '';
      return logDate === todayStr;
    });
  }, [history, todayStr]);

  // Checked in if today's checkIn exists and checkOut does not
  const isCurrentlyCheckedIn = useMemo(() => {
    if (!todaySession) return false;
    return !!todaySession.checkIn && !todaySession.checkOut;
  }, [todaySession]);

  // Check-In Mutation
  const checkInMutation = useMutation({
    mutationFn: (businessId: string) => attendanceApi.checkIn(businessId),
    onSuccess: () => {
      setMessage({
        text: 'Checked in successfully! Workout session started. Keep that streak alive!',
        isError: false,
      });
      setManualGymId('');
      queryClient.invalidateQueries({ queryKey: ['member-attendance-me'] });
    },
    onError: (err: any) => {
      setMessage({
        text:
          err.response?.data?.message ||
          'Check-in failed. Please ensure you hold an active membership at this gym.',
        isError: true,
      });
    },
  });

  // Check-Out Mutation
  const checkOutMutation = useMutation({
    mutationFn: (businessId: string) => attendanceApi.checkOut(businessId),
    onSuccess: () => {
      setMessage({
        text: 'Checked out successfully. Amazing workout session!',
        isError: false,
      });
      setManualGymId('');
      queryClient.invalidateQueries({ queryKey: ['member-attendance-me'] });
    },
    onError: (err: any) => {
      setMessage({
        text:
          err.response?.data?.message ||
          'Check-out failed. Please verify that you are currently checked in.',
        isError: true,
      });
    },
  });

  const isActionPending = checkInMutation.isPending || checkOutMutation.isPending;

  const handleQuickAction = (businessId: string) => {
    setMessage(null);
    if (isCurrentlyCheckedIn) {
      checkOutMutation.mutate(businessId);
    } else {
      checkInMutation.mutate(businessId);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    let id = manualGymId.trim();
    if (!id) {
      setMessage({ text: 'Please enter or scan a valid Gym ID', isError: true });
      return;
    }

    // Parse JSON if QR scanned code contains JSON
    try {
      if (id.startsWith('{')) {
        const parsed = JSON.parse(id);
        if (parsed.businessId) id = parsed.businessId;
      }
    } catch {
      // Use raw ID string
    }

    if (manualMode === 'CHECK_IN') {
      checkInMutation.mutate(id);
    } else {
      checkOutMutation.mutate(id);
    }
  };

  // Helper to compute duration string
  const getSessionDuration = (checkIn?: string | null, checkOut?: string | null) => {
    if (!checkIn) return '—';
    if (!checkOut) return 'In Progress';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMins = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (isAttendanceLoading || isMembershipsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Motivational Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Workout Consistency
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance & Streak Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log your daily gym visits, build unstoppable workout streaks, and track personal fitness milestones.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => refetchAttendance()}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isAttendanceFetching ? 'animate-spin' : ''}`} />}
          className="text-xs self-start sm:self-auto"
        >
          Sync Records
        </Button>
      </div>

      {/* Streak & Gamification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Current Streak */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider opacity-90">
                Current Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-200 animate-bounce" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {summary.currentStreak}{' '}
              <span className="text-sm font-medium opacity-90">
                {summary.currentStreak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
          <p className="text-xs text-orange-100 mt-4">
            {summary.currentStreak > 0
              ? `🔥 Outstanding dedication! Keep turning up tomorrow.`
              : `Check in today to fire up your workout streak!`}
          </p>
        </div>

        {/* Card 2: Longest Streak / Personal Best */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Personal Record
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.longestStreak}{' '}
              <span className="text-sm font-medium text-slate-400">
                {summary.longestStreak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Your longest consecutive gym attendance run</p>
        </div>

        {/* Card 3: Total Workout Sessions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Total Days Visited
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.totalDays}{' '}
              <span className="text-sm font-medium text-slate-400">
                {summary.totalDays === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Total distinct gym workout days on record</p>
        </div>
      </div>

      {/* Global Status Message Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 shadow-sm transition-all ${
            message.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {message.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* REAL-TIME SESSION STATUS BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isCurrentlyCheckedIn
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isCurrentlyCheckedIn ? (
              <Dumbbell className="w-6 h-6 animate-pulse text-emerald-400" />
            ) : (
              <Clock className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isCurrentlyCheckedIn ? 'Currently Training at Gym' : 'Not Checked In'}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isCurrentlyCheckedIn
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCurrentlyCheckedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                {isCurrentlyCheckedIn ? 'Active Workout Session' : 'Off-Session'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isCurrentlyCheckedIn
                ? `Checked in at ${new Date(todaySession!.checkIn!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} · Remember to check out before leaving!`
                : 'Tap quick check-in below or scan the entrance QR code to begin today’s workout.'}
            </p>
          </div>
        </div>

        {/* If currently checked in, provide an instant 1-click Check-Out button right in the banner */}
        {isCurrentlyCheckedIn && activeMemberships.length > 0 && (
          <Button
            variant="primary"
            size="md"
            onClick={() => handleQuickAction(activeMemberships[0].businessId)}
            isLoading={isActionPending}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full md:w-auto rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 text-white font-bold text-xs"
          >
            Check Out Now
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'quick'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Quick Check-In / Out
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'scanner'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" /> Scan Gym QR / Enter ID
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Attendance History ({history.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUICK 1-CLICK GYM ACCESS */}
      {/* ========================================================================= */}
      {activeTab === 'quick' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enrolled Gym Facilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click attendance logging for your active memberships. No QR code needed!
            </p>
          </div>

          {activeMemberships.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Active Gym Memberships Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not currently have an approved active membership. If you have a scan code from your front desk, use the QR Scanner tab.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('scanner')}
                leftIcon={<QrCode className="w-3.5 h-3.5" />}
              >
                Open QR Scanner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMemberships.map((membership: Membership) => {
                const gymName = membership.business?.name || 'Partner Gym';
                const planName = membership.plan?.name || 'Active Membership';

                return (
                  <div
                    key={membership.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {gymName}
                          </h4>
                          <p className="text-xs text-slate-500">{planName}</p>
                        </div>
                      </div>
                      <StatusBadge status={membership.status} />
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                        ID: {membership.businessId}
                      </span>

                      {isCurrentlyCheckedIn ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleQuickAction(membership.businessId)}
                          isLoading={isActionPending}
                          leftIcon={<LogOut className="w-3.5 h-3.5" />}
                          className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 text-xs"
                        >
                          Check Out
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleQuickAction(membership.businessId)}
                          isLoading={isActionPending}
                          leftIcon={<LogIn className="w-3.5 h-3.5" />}
                          className="bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 text-xs"
                        >
                          Check In Now
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QR SCANNER & MANUAL GYM ID ENTRY */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-400 px-3 py-1 rounded-full">
              Touchless Access
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
              Scan Gym Kiosk Display
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Position the front-desk QR stand in camera view, or paste the Gym ID below
            </p>
          </div>

          {/* Action Mode Switcher: Check-In vs Check-Out */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setManualMode('CHECK_IN')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                manualMode === 'CHECK_IN'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Check In
            </button>
            <button
              type="button"
              onClick={() => setManualMode('CHECK_OUT')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                manualMode === 'CHECK_OUT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" /> Check Out
            </button>
          </div>

          {/* Camera Scanner Viewfinder Simulation */}
          <div className="relative w-64 h-64 mx-auto border-2 border-dashed border-orange-500/60 rounded-3xl flex flex-col items-center justify-center bg-orange-50/20 dark:bg-orange-950/20 overflow-hidden shadow-inner">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent top-0 animate-[bounce_2s_infinite]" />
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Point at Gym Kiosk QR
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
              {manualMode === 'CHECK_IN' ? 'Scanning for entry log...' : 'Scanning for exit checkout...'}
            </p>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-3 text-left">
            <Input
              label="Or Enter Gym ID Manually"
              placeholder="e.g. paste Gym UUID or QR payload..."
              value={manualGymId}
              onChange={(e) => setManualGymId(e.target.value)}
              disabled={isActionPending}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isActionPending}
              className={`w-full text-xs font-bold ${
                manualMode === 'CHECK_OUT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {manualMode === 'CHECK_IN' ? 'Confirm Check In' : 'Confirm Check Out'}
            </Button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Attendance Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed chronological logs of all check-in & check-out workout sessions.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {history.length} Record{history.length === 1 ? '' : 's'}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Sessions Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Check in to your gym facility to record your first visit and kick off your fitness streak.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Date</th>
                      <th className="py-3.5 px-5">Gym Facility</th>
                      <th className="py-3.5 px-5">Check In</th>
                      <th className="py-3.5 px-5">Check Out</th>
                      <th className="py-3.5 px-5">Duration</th>
                      <th className="py-3.5 px-5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-xs sm:text-sm">
                    {history.map((row, idx) => {
                      const durationStr = getSessionDuration(row.checkIn, row.checkOut);
                      return (
                        <tr
                          key={row.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-orange-500" />
                              {new Date(row.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {row.business || row.businessName || 'Gym Facility'}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                            {row.checkIn ? (
                              <span className="flex items-center gap-1.5 font-mono text-xs">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                {new Date(row.checkIn).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                            {row.checkOut ? (
                              <span className="flex items-center gap-1.5 font-mono text-xs">
                                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                {new Date(row.checkOut).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : row.checkIn ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                In Progress
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3.5 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {durationStr}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {row.method === 'FINGERPRINT' ? (
                                <Fingerprint className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Smartphone className="w-3 h-3 text-emerald-500" />
                              )}
                              {row.method || 'MANUAL'}
                            </span>
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
      )}
    </div>
  );
}
