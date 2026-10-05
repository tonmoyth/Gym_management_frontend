'use strict';
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { membershipApi } from '@/lib/api/membership.api';
import { attendanceApi } from '@/lib/api/attendance.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';
import {
  Users,
  Search,
  History,
  Calendar,
  Clock,
  UserCheck,
  Mail,

  QrCode,
  Activity
} from 'lucide-react';

export default function OwnerMembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED'>('ALL');
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch all enrolled members for this business
  const { data: membersRes, isLoading: isMembersLoading } = useQuery({
    queryKey: ['business-enrolled-members', businessId],
    queryFn: () => membershipApi.getBusinessMembers(businessId!),
    enabled: !!businessId,
  });

  // 3. Fetch specific member check-in history if modal open
  const { data: memberHistoryRes, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['member-history', businessId, selectedMember?.id],
    queryFn: () => attendanceApi.getMemberHistory(businessId!, selectedMember!.id),
    enabled: !!businessId && !!selectedMember?.id,
  });

  const allMembers: any[] = membersRes?.data?.data || [];

  // Filter members by search term and status tab
  const filteredMembers = allMembers.filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.plan?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return m.status === 'ACTIVE';
    if (statusFilter === 'PENDING') return m.status === 'PENDING_APPROVAL' || m.status === 'PENDING';
    if (statusFilter === 'EXPIRED') return m.status === 'EXPIRED' || m.status === 'CANCELLED';

    return true;
  });

  // Metric stats
  const totalCount = allMembers.length;
  const activeCount = allMembers.filter((m) => m.status === 'ACTIVE').length;
  const totalVisits = allMembers.reduce((acc, curr) => acc + (curr.totalCheckIns || 0), 0);

  const memberHistory = memberHistoryRes?.data?.data || [];

  if (isBusinessLoading || isMembersLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Enrolled Members</h1>
          <p className="text-slate-400 mt-1 text-sm">
            View active gym attendees, membership plans, check-in history, and validity.
          </p>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Members</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Check-Ins</p>
            <p className="text-2xl font-black text-purple-400 mt-0.5">{totalVisits} Visits</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="max-w-md flex-1">
          <Input
            placeholder="Search by member name, email, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          {(['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                statusFilter === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {tab === 'ALL' && `All (${totalCount})`}
              {tab === 'ACTIVE' && `Active (${activeCount})`}
              {tab === 'PENDING' && `Pending (${allMembers.filter(m => m.status === 'PENDING_APPROVAL' || m.status === 'PENDING').length})`}
              {tab === 'EXPIRED' && `Expired (${allMembers.filter(m => m.status === 'EXPIRED' || m.status === 'CANCELLED').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Enrolled Members Found"
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'No members match your active search and filter criteria.'
              : 'Members will appear here once they book a membership plan.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Plan & Validity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Total Visits</th>
                  <th className="py-4 px-6">Last Check-In</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Member Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {member.profilePhoto ? (
                          <img
                            src={member.profilePhoto}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                            {(member.name || 'MB').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{member.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan & Validity Dates */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-white text-xs">
                          {member.plan?.name || 'Standard Plan'}
                        </p>
                        <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
                          {formatCurrency(member.plan?.price)} · {member.plan?.durationDays || 30} Days
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {member.startDate && member.endDate ? (
                            <span>
                              {new Date(member.startDate).toLocaleDateString()} - {new Date(member.endDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="italic">Not yet activated</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={member.status} />
                    </td>

                    {/* Total Check-Ins */}
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-slate-400" />
                        {member.totalCheckIns || 0} Visits
                      </span>
                    </td>

                    {/* Last Check-In */}
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {member.lastSeen ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {new Date(member.lastSeen).toLocaleDateString()} at{' '}
                            {new Date(member.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No check-ins yet</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMember({ id: member.memberId, name: member.name })}
                        leftIcon={<History className="w-3.5 h-3.5" />}
                        className="text-xs rounded-xl"
                      >
                        Attendance History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member History Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={`Attendance History - ${selectedMember?.name}`}
      >
        <div className="space-y-4">
          {isHistoryLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-800 rounded animate-pulse" />
              <div className="h-12 bg-slate-800 rounded animate-pulse" />
              <div className="h-12 bg-slate-800 rounded animate-pulse" />
            </div>
          ) : memberHistory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No attendance check-in records logged for this member yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {memberHistory.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${log.attendanceType === 'CHECK_IN' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} />
                    <span className="font-bold text-white uppercase">{log.attendanceType}</span>
                    <span className="text-slate-400">via {log.verifyMethod}</span>
                  </div>
                  <span className="text-slate-400">
                    {new Date(log.attendanceTime).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setSelectedMember(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
