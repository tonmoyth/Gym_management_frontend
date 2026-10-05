'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { attendanceApi } from '@/lib/api/attendance.api';
import { QrDisplay } from '@/components/ui/QrDisplay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { CardSkeleton, TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import {
  QrCode,
  Cpu,
  Plus,
  Trash2,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Search,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Activity,
  Percent,
  Radio,
  Fingerprint,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  BiometricDevice,
  AttendanceLog,
  BiometricAttendanceType,
  VerifyMethod,
} from '@/types/api.types';

export default function OwnerAttendancePage() {
  const queryClient = useQueryClient();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'stream' | 'devices' | 'kiosk'>('stream');

  // Modals
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<{
    id: string;
    name: string;
    email?: string;
  } | null>(null);

  // Device Form State
  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [brand, setBrand] = useState('ZKTeco');
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Test Punch Simulator Form State
  const [testSN, setTestSN] = useState('');
  const [testBiometricId, setTestBiometricId] = useState('');
  const [testType, setTestType] = useState<BiometricAttendanceType>('CHECK_IN');
  const [testMethod, setTestMethod] = useState<VerifyMethod>('FINGERPRINT');
  const [testStatusMessage, setTestStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | '7D' | '30D' | 'ALL' | 'CUSTOM'>('TODAY');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedGymId, setCopiedGymId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch today's summary
  const {
    data: summaryRes,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['attendance-today', businessId],
    queryFn: () => attendanceApi.getTodaySummary(businessId!),
    enabled: !!businessId,
    refetchInterval: 15000, // Live poll every 15s
  });

  const summary = summaryRes?.data?.data || {
    totalCheckIn: 0,
    currentlyInside: 0,
    totalCheckOut: 0,
    attendanceRate: 0,
  };

  // Compute date range params based on preset
  const getDateRange = () => {
    const now = new Date();
    if (dateFilter === 'TODAY') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return {
        dateFrom: todayStart.toISOString(),
        dateTo: todayEnd.toISOString(),
      };
    }
    if (dateFilter === '7D') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        dateFrom: sevenDaysAgo.toISOString(),
        dateTo: now.toISOString(),
      };
    }
    if (dateFilter === '30D') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        dateFrom: thirtyDaysAgo.toISOString(),
        dateTo: now.toISOString(),
      };
    }
    if (dateFilter === 'CUSTOM') {
      return {
        dateFrom: customDateFrom ? new Date(customDateFrom).toISOString() : undefined,
        dateTo: customDateTo ? new Date(customDateTo + 'T23:59:59').toISOString() : undefined,
      };
    }
    return {};
  };

  const { dateFrom, dateTo } = getDateRange();

  // 3. Fetch attendance logs with filters
  const {
    data: logsRes,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: [
      'attendance-logs',
      businessId,
      currentPage,
      searchTerm,
      dateFilter,
      dateFrom,
      dateTo,
      typeFilter,
      methodFilter,
    ],
    queryFn: () =>
      attendanceApi.getReport(businessId!, {
        page: currentPage,
        limit: 15,
        searchTerm: searchTerm.trim() || undefined,
        dateFrom,
        dateTo,
        attendanceType: typeFilter !== 'ALL' ? (typeFilter as BiometricAttendanceType) : undefined,
        verifyMethod: methodFilter !== 'ALL' ? (methodFilter as VerifyMethod) : undefined,
      }),
    enabled: !!businessId,
  });

  const logs = logsRes?.data?.data || [];
  const meta = logsRes?.data?.meta || { page: 1, limit: 15, total: logs.length, totalPages: 1 };

  // 4. Fetch biometric devices
  const {
    data: devicesRes,
    isLoading: isDevicesLoading,
    refetch: refetchDevices,
  } = useQuery({
    queryKey: ['biometric-devices', businessId],
    queryFn: () => attendanceApi.getDevices(businessId!),
    enabled: !!businessId,
  });

  const devices = devicesRes?.data?.data || [];

  // 5. Fetch specific member history if modal opened
  const { data: memberHistoryRes, isLoading: isMemberHistoryLoading } = useQuery({
    queryKey: ['member-attendance-history', businessId, selectedMemberForHistory?.id],
    queryFn: () =>
      attendanceApi.getMemberHistory(businessId!, selectedMemberForHistory!.id, { limit: 50 }),
    enabled: !!businessId && !!selectedMemberForHistory?.id,
  });

  const memberHistoryLogs = memberHistoryRes?.data?.data || [];

  // Register Device Mutation
  const registerMutation = useMutation({
    mutationFn: (data: { name: string; serialNumber: string; brand: string }) =>
      attendanceApi.registerDevice(businessId!, data),
    onSuccess: () => {
      setIsDeviceModalOpen(false);
      setDeviceName('');
      setSerialNumber('');
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', businessId] });
    },
    onError: (err: any) => {
      setDeviceError(err.response?.data?.message || 'Failed to register biometric device.');
    },
  });

  // Delete Device Mutation
  const deleteMutation = useMutation({
    mutationFn: (deviceId: string) =>
      attendanceApi.deleteDevice(businessId!, deviceId),
    onSuccess: () => {
      setDeletingDeviceId(null);
      queryClient.invalidateQueries({ queryKey: ['biometric-devices', businessId] });
    },
  });

  // Test Punch Mutation (Simulate Biometric Hardware)
  const testPunchMutation = useMutation({
    mutationFn: (data: {
      serialNumber: string;
      biometricId: string;
      attendanceTime: string;
      verifyMethod: VerifyMethod;
      type: BiometricAttendanceType;
    }) => attendanceApi.testDevice(data),
    onSuccess: (res) => {
      const processed = res.data?.data?.processed ?? 1;
      setTestStatusMessage({
        text: `Device punch processed successfully (${processed} log generated). Live stream updated!`,
        isError: false,
      });
      // Invalidate attendance logs and summary
      queryClient.invalidateQueries({ queryKey: ['attendance-today', businessId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-logs', businessId] });
    },
    onError: (err: any) => {
      setTestStatusMessage({
        text: err.response?.data?.message || 'Punch failed. Check serial number or biometric ID.',
        isError: true,
      });
    },
  });

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setDeviceError(null);
    registerMutation.mutate({
      name: deviceName.trim(),
      serialNumber: serialNumber.trim(),
      brand: brand.trim(),
    });
  };

  const handleTestPunch = (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatusMessage(null);
    if (!testSN.trim() || !testBiometricId.trim()) {
      setTestStatusMessage({ text: 'Device Serial Number and Biometric ID are required.', isError: true });
      return;
    }
    testPunchMutation.mutate({
      serialNumber: testSN.trim(),
      biometricId: testBiometricId.trim(),
      attendanceTime: new Date().toISOString(),
      verifyMethod: testMethod,
      type: testType,
    });
  };

  const handleCopyGymId = () => {
    if (!businessId) return;
    navigator.clipboard.writeText(businessId);
    setCopiedGymId(true);
    setTimeout(() => setCopiedGymId(false), 2000);
  };

  const handleCopyWebhookUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/api/v1/iclock/cdata`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRefreshAll = () => {
    refetchSummary();
    refetchLogs();
    refetchDevices();
  };

  const getRelativeHeartbeat = (dateString?: string) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return past.toLocaleDateString();
  };

  if (isBusinessLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Live Access Control
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Facility: {business?.name || 'My Gym'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Attendance & Access Control
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Monitor real-time gym check-ins, manage ZKTeco biometric turnstiles, and inspect member attendance history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshAll}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSummaryFetching || isLogsFetching ? 'animate-spin' : ''}`} />}
            className="text-xs"
            title="Refresh Live Data"
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTestStatusMessage(null);
              if (devices.length > 0) {
                setTestSN(devices[0].serialNumber);
              }
              setIsTestModalOpen(true);
            }}
            leftIcon={<Cpu className="w-3.5 h-3.5 text-purple-400" />}
            className="text-xs"
          >
            Test Device Punch
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setActiveTab('kiosk')}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs shadow-md shadow-blue-600/20"
          >
            Print QR Poster
          </Button>
        </div>
      </div>

      {/* Real-time KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Check-Ins */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Total Check-Ins Today
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {isSummaryLoading ? '...' : summary.totalCheckIn}
            </div>
            <p className="text-[11px] text-slate-500">Daily entry sessions recorded</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Currently Inside Gym */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Currently Inside
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {isSummaryLoading ? '...' : summary.currentlyInside}
            </div>
            <p className="text-[11px] text-slate-500">Active members inside facility</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Completed Sessions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Completed Workouts
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">
              {isSummaryLoading ? '...' : summary.totalCheckOut}
            </div>
            <p className="text-[11px] text-slate-500">Checked out after training</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Attendance Rate
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {isSummaryLoading ? '...' : `${summary.attendanceRate}%`}
            </div>
            <p className="text-[11px] text-slate-500">Of active gym roster visited</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('stream')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer text-xs sm:text-sm ${
            activeTab === 'stream'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Live Attendance Stream & Logs
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {meta.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer text-xs sm:text-sm ${
            activeTab === 'devices'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" /> Biometric Devices & ADMS
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {devices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kiosk')}
          className={`pb-3 font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer text-xs sm:text-sm ${
            activeTab === 'kiosk'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" /> Front Desk QR Stand
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE ATTENDANCE STREAM & ADVANCED REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'stream' && (
        <div className="space-y-5">
          {/* Advanced Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search member by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              {/* Date Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('TODAY');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    dateFilter === 'TODAY'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('7D');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    dateFilter === '7D'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('30D');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    dateFilter === '30D'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    dateFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  All History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('CUSTOM');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                    dateFilter === 'CUSTOM'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Custom
                </button>
              </div>
            </div>

            {/* Sub-row: Custom date pickers + Type & Method Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 text-xs">
              {dateFilter === 'CUSTOM' && (
                <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[11px] px-1">From:</span>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => {
                      setCustomDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-900 text-white px-2 py-1 rounded text-xs border border-slate-700 focus:outline-none"
                  />
                  <span className="text-slate-400 text-[11px] px-1">To:</span>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => {
                      setCustomDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-900 text-white px-2 py-1 rounded text-xs border border-slate-700 focus:outline-none"
                  />
                </div>
              )}

              {/* Event Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="ALL">All Events</option>
                  <option value="CHECK_IN">Check-Ins Only</option>
                  <option value="CHECK_OUT">Check-Outs Only</option>
                </select>
              </div>

              {/* Verify Method Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="ALL">All Methods</option>
                  <option value="FINGERPRINT">Fingerprint</option>
                  <option value="FACE">Face Recognition</option>
                  <option value="RFID">RFID Card</option>
                  <option value="MANUAL">Manual / QR App</option>
                </select>
              </div>

              {(searchTerm || typeFilter !== 'ALL' || methodFilter !== 'ALL' || dateFilter !== 'TODAY') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('TODAY');
                    setTypeFilter('ALL');
                    setMethodFilter('ALL');
                    setCustomDateFrom('');
                    setCustomDateTo('');
                    setCurrentPage(1);
                  }}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          {isLogsLoading ? (
            <TableSkeleton rows={7} cols={5} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No Attendance Logs Found"
              description="No check-in or check-out events matched your selected date range and filters."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDateFilter('ALL');
                    setSearchTerm('');
                    setTypeFilter('ALL');
                    setMethodFilter('ALL');
                  }}
                >
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Member</th>
                      <th className="py-3.5 px-5">Event</th>
                      <th className="py-3.5 px-5">Verification</th>
                      <th className="py-3.5 px-5">Device / Access Point</th>
                      <th className="py-3.5 px-5 text-right">Timestamp</th>
                      <th className="py-3.5 px-5 text-right">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-xs sm:text-sm">
                    {logs.map((log: AttendanceLog) => {
                      const memberUser = log.member?.user;
                      const memberName = memberUser?.fullName || 'Gym Member';
                      const memberEmail = memberUser?.email || '';
                      const isCheckIn = log.attendanceType === 'CHECK_IN';
                      const deviceLabel = log.device ? `${log.device.name} (SN: ${log.device.serialNumber})` : 'Front Desk QR / App';

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Member */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                                {memberName.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    log.member?.id &&
                                    setSelectedMemberForHistory({
                                      id: log.member.id,
                                      name: memberName,
                                      email: memberEmail,
                                    })
                                  }
                                  className="font-bold text-white hover:text-blue-400 transition-colors text-left truncate block cursor-pointer"
                                >
                                  {memberName}
                                </button>
                                {memberEmail && (
                                  <p className="text-[11px] text-slate-500 truncate">{memberEmail}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Event Type */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isCheckIn
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCheckIn ? 'bg-emerald-400' : 'bg-purple-400'
                                }`}
                              />
                              {log.attendanceType === 'CHECK_IN' ? 'Check In' : 'Check Out'}
                            </span>
                          </td>

                          {/* Verify Method */}
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                              {log.verifyMethod === 'FINGERPRINT' && (
                                <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              {log.verifyMethod === 'RFID' && (
                                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {log.verifyMethod === 'MANUAL' && (
                                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {log.verifyMethod}
                            </span>
                          </td>

                          {/* Device */}
                          <td className="py-3.5 px-5 text-xs text-slate-400">
                            <span className="truncate max-w-[200px] block" title={deviceLabel}>
                              {deviceLabel}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-5 text-right text-xs text-slate-400 whitespace-nowrap">
                            <div className="font-bold text-slate-200">
                              {new Date(log.attendanceTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {new Date(log.attendanceTime).toLocaleDateString()}
                            </div>
                          </td>

                          {/* History Action */}
                          <td className="py-3.5 px-5 text-right">
                            {log.member?.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedMemberForHistory({
                                    id: log.member!.id,
                                    name: memberName,
                                    email: memberEmail,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                title="View Member Visits"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {meta.totalPages > 1 && (
                <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
                  <div>
                    Page <span className="font-bold text-white">{meta.page}</span> of{' '}
                    <span className="font-bold text-white">{meta.totalPages}</span> ({meta.total} total logs)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= meta.totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BIOMETRIC HARDWARE FLEET & ZKTECO SETUP */}
      {/* ========================================================================= */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Registered Devices List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Linked Hardware Fleet</h3>
                  <p className="text-xs text-slate-400">
                    ZKTeco biometric terminals, RFID gates, and facial scanners registered to this facility.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setDeviceError(null);
                    setIsDeviceModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Add Terminal
                </Button>
              </div>

              {isDevicesLoading ? (
                <TableSkeleton rows={4} />
              ) : devices.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Hardware Terminals Connected</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Link your ZKTeco turnstile terminal by entering its serial number. The terminal will stream real-time punches to this dashboard.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsDeviceModalOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Register First Terminal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {devices.map((device: BiometricDevice) => {
                    const isOnline = device.status === 'ONLINE';
                    return (
                      <div
                        key={device.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              isOnline
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{device.name}</h4>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  isOnline
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                  }`}
                                />
                                {device.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                              <span>SN: {device.serialNumber}</span>
                              <span>·</span>
                              <span>Brand: {device.brand}</span>
                              <span>·</span>
                              <span>Heartbeat: {getRelativeHeartbeat(device.lastHeartbeat)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTestSN(device.serialNumber);
                              setIsTestModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border border-purple-500/20 transition-colors cursor-pointer"
                          >
                            Simulate Punch
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDeviceId(device.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="Unlink Terminal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 1 Col: ADMS Setup Guide */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Radio className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">ZKTeco Cloud ADMS Settings</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure your physical ZKTeco terminal menu (under <strong>COMM. &gt; Cloud Server / ADMS</strong>) to stream attendance in real-time.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Server Push Endpoint</label>
                    <div className="flex items-center gap-1.5 p-2 bg-slate-800/80 rounded-xl border border-slate-700 font-mono text-[11px] text-slate-200 break-all">
                      <span>/api/v1/iclock/cdata</span>
                      <button
                        type="button"
                        onClick={handleCopyWebhookUrl}
                        className="ml-auto text-slate-400 hover:text-white p-1"
                        title="Copy full URL"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                      <span className="text-slate-500 block">Push Delay</span>
                      <span className="font-mono text-white font-bold">10 Seconds</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                      <span className="text-slate-500 block">TransInterval</span>
                      <span className="font-mono text-white font-bold">1 Minute</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>
                    The terminal automatically synchronizes clock timestamps and transmits punches immediately upon member verification.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FRONT DESK QR STAND & PRINTABLE POSTER */}
      {/* ========================================================================= */}
      {activeTab === 'kiosk' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white">Front Desk QR Kiosk Stand</h3>
            <p className="text-xs text-slate-400">
              Place this display at your gym turnstiles or reception counter for touchless mobile member check-ins.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            {businessId && (
              <div className="space-y-6 flex flex-col items-center">
                <QrDisplay
                  businessId={businessId}
                  businessName={business?.name || 'Fitness Club'}
                  size={240}
                  className="shadow-2xl border-none"
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyGymId}
                    leftIcon={copiedGymId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    {copiedGymId ? 'Copied Gym ID!' : 'Copy Gym ID'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    className="text-xs shadow-md shadow-blue-600/20"
                  >
                    Print Front Desk Poster
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER BIOMETRIC DEVICE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        title="Register Biometric Terminal"
      >
        <form onSubmit={handleRegisterDevice} className="space-y-4">
          {deviceError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deviceError}</span>
            </div>
          )}

          <Input
            label="Device Label / Location *"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. Front Turnstile Terminal"
            required
          />

          <Input
            label="Hardware Serial Number (SN) *"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. CLK920048123"
            required
          />

          <Input
            label="Hardware Brand *"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="ZKTeco"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeviceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={registerMutation.isPending}
            >
              Link Terminal
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: INTERACTIVE BIOMETRIC PUNCH SIMULATOR */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Biometric Hardware Simulator (Test Punch)"
      >
        <form onSubmit={handleTestPunch} className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulate a physical ZKTeco terminal punch directly to test access control turnstiles, attendance queues, and real-time dashboard updates without needing hardware on-site.
          </p>

          {testStatusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatusMessage.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {testStatusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{testStatusMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Device Serial Number (SN) *
            </label>
            {devices.length > 0 ? (
              <select
                value={testSN}
                onChange={(e) => setTestSN(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                required
              >
                {devices.map((d: BiometricDevice) => (
                  <option key={d.id} value={d.serialNumber}>
                    {d.name} ({d.serialNumber})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={testSN}
                onChange={(e) => setTestSN(e.target.value)}
                placeholder="Enter Registered Terminal Serial Number"
                required
              />
            )}
          </div>

          <Input
            label="Biometric ID / Member Card ID *"
            value={testBiometricId}
            onChange={(e) => setTestBiometricId(e.target.value)}
            placeholder="e.g. 1001 or Member Biometric Identifier"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Attendance Event
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as BiometricAttendanceType)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CHECK_IN">CHECK_IN (Entry)</option>
                <option value="CHECK_OUT">CHECK_OUT (Exit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verify Method
              </label>
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value as VerifyMethod)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="FINGERPRINT">Fingerprint</option>
                <option value="FACE">Facial Recognition</option>
                <option value="RFID">RFID Smart Card</option>
                <option value="MANUAL">Manual / QR</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTestModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={testPunchMutation.isPending}
            >
              Simulate Terminal Punch
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: MEMBER VISIT HISTORY INSPECTION */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedMemberForHistory}
        onClose={() => setSelectedMemberForHistory(null)}
        title={selectedMemberForHistory ? `Attendance History: ${selectedMemberForHistory.name}` : 'Member History'}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span>{selectedMemberForHistory?.email}</span>
            <span>Total Visits: {memberHistoryLogs.length}</span>
          </div>

          {isMemberHistoryLoading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : memberHistoryLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No historical visits found for this member in this facility.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
              {memberHistoryLogs.map((h: AttendanceLog) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mr-2 ${
                        h.attendanceType === 'CHECK_IN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {h.attendanceType}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{h.verifyMethod}</span>
                  </div>
                  <div className="text-right text-slate-300">
                    <div>{new Date(h.attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-500">{new Date(h.attendanceTime).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedMemberForHistory(null)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Device Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDeviceId}
        onClose={() => setDeletingDeviceId(null)}
        onConfirm={() => deletingDeviceId && deleteMutation.mutate(deletingDeviceId)}
        title="Unlink Biometric Hardware?"
        description="Attendance logs previously captured by this terminal will be preserved in your database, but future punches from this serial number will be ignored."
        confirmLabel="Unlink Terminal"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
